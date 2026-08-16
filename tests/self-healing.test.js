const fs = require('fs/promises');
const { exec } = require('child_process');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { parseError, getFix, runSelfHealing } = require('../scripts/self-healing');

// Mock dependencies
jest.mock('fs/promises');
jest.mock('child_process');
jest.mock('@google/generative-ai');

describe('Self-Healing Agent Test Suite', () => {
  let mockGenerateContent;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup Gemini API Mock
    mockGenerateContent = jest.fn();
    GoogleGenerativeAI.mockImplementation(() => ({
      getGenerativeModel: () => ({
        generateContent: mockGenerateContent,
      }),
    }));
  });

  describe('parseError', () => {
    it('should correctly parse TypeScript compilation errors', () => {
      const tsError = `src/components/Button.tsx(12,24): error TS2322: Type 'string' is not assignable to type 'number'.`;
      const result = parseError(tsError);

      expect(result).toEqual({
        filePath: 'src/components/Button.tsx',
        line: 12,
        column: 24,
        message: "Type 'string' is not assignable to type 'number'.",
      });
    });

    it('should correctly parse ESLint errors', () => {
      const eslintError = `/workspace/src/utils/helper.js: line 5, col 10, Error - 'unusedVar' is defined but never used. (no-unused-vars)`;
      const result = parseError(eslintError);

      expect(result).toEqual({
        filePath: '/workspace/src/utils/helper.js',
        line: 5,
        column: 10,
        message: "'unusedVar' is defined but never used. (no-unused-vars)",
      });
    });

    it('should parse generic stack trace errors', () => {
      const genericError = `Error: Something went wrong\n    at Object.<anonymous> (/workspace/src/index.js:15:20)`;
      const result = parseError(genericError);

      expect(result).toEqual({
        filePath: '/workspace/src/index.js',
        line: 15,
        column: 20,
        message: 'Error: Something went wrong',
      });
    });

    it('should return null if no error pattern matches', () => {
      const cleanOutput = 'All tests passed successfully!';
      const result = parseError(cleanOutput);

      expect(result).toBeNull();
    });
  });

  describe('getFix', () => {
    it('should call Gemini API with correct prompt and extract code block', async () => {
      const mockResponseText = '```javascript\nconst x = 42;\nmodule.exports = x;\n```';
      mockGenerateContent.mockResolvedValue({
        response: {
          text: () => mockResponseText,
        },
      });

      const filePath = 'src/index.js';
      const fileContent = 'const x = "forty-two";\nmodule.exports = x;';
      const errorDetails = {
        line: 1,
        column: 11,
        message: 'Type string is not assignable to number',
      };

      const fixedCode = await getFix(filePath, fileContent, errorDetails);

      expect(GoogleGenerativeAI).toHaveBeenCalled();
      expect(mockGenerateContent).toHaveBeenCalledWith(
        expect.stringContaining('Type string is not assignable to number')
      );
      expect(fixedCode).toBe('const x = 42;\nmodule.exports = x;');
    });

    it('should handle raw code responses without markdown fences', async () => {
      const mockResponseText = 'const x = 100;';
      mockGenerateContent.mockResolvedValue({
        response: {
          text: () => mockResponseText,
        },
      });

      const fixedCode = await getFix('src/index.js', 'const x = "100";', { line: 1, column: 1, message: 'error' });
      expect(fixedCode).toBe('const x = 100;');
    });

    it('should throw an error if the Gemini API call fails', async () => {
      mockGenerateContent.mockRejectedValue(new Error('API Error'));

      await expect(
        getFix('src/index.js', 'const x = 1;', { line: 1, column: 1, message: 'error' })
      ).rejects.toThrow('API Error');
    });
  });

  describe('runSelfHealing', () => {
    it('should return true immediately if the build command succeeds', async () => {
      exec.mockImplementation((cmd, callback) => {
        callback(null, { stdout: 'Build successful', stderr: '' });
      });

      const success = await runSelfHealing('npm run build');

      expect(success).toBe(true);
      expect(exec).toHaveBeenCalledTimes(1);
      expect(fs.readFile).not.toHaveBeenCalled();
    });

    it('should attempt to heal and succeed if the fix resolves the error', async () => {
      // First build fails, second build succeeds
      exec
        .mockImplementationOnce((cmd, callback) => {
          const err = new Error('Build failed');
          err.code = 1;
          callback(err, { stdout: '', stderr: 'src/index.js(1,10): error TS2322: Type error' });
        })
        .mockImplementationOnce((cmd, callback) => {
          callback(null, { stdout: 'Build successful', stderr: '' });
        });

      fs.readFile.mockResolvedValue('const x: string = 123;');
      fs.writeFile.mockResolvedValue(undefined);

      mockGenerateContent.mockResolvedValue({
        response: {
          text: () => '```typescript\nconst x: number = 123;\n```',
        },
      });

      const success = await runSelfHealing('npm run build', 3);

      expect(success).toBe(true);
      expect(fs.readFile).toHaveBeenCalledWith('src/index.js', 'utf8');
      expect(fs.writeFile).toHaveBeenCalledWith('src/index.js', 'const x: number = 123;', 'utf8');
      expect(exec).toHaveBeenCalledTimes(2);
    });

    it('should rollback and return false if the fix does not resolve the error', async () => {
      // Both builds fail
      exec.mockImplementation((cmd, callback) => {
        const err = new Error('Build failed');
        err.code = 1;
        callback(err, { stdout: '', stderr: 'src/index.js(1,10): error TS2322: Type error' });
      });

      const originalContent = 'const x: string = 123;';
      fs.readFile.mockResolvedValue(originalContent);
      fs.writeFile.mockResolvedValue(undefined);

      mockGenerateContent.mockResolvedValue({
        response: {
          text: () => '```typescript\nconst x: number = 123;\n```',
        },
      });

      const success = await runSelfHealing('npm run build', 1);

      expect(success).toBe(false);
      // Verify rollback occurred
      expect(fs.writeFile).toHaveBeenLastCalledWith('src/index.js', originalContent, 'utf8');
    });

    it('should stop and return false when max retries are exceeded', async () => {
      exec.mockImplementation((cmd, callback) => {
        const err = new Error('Build failed');
        err.code = 1;
        callback(err, { stdout: '', stderr: 'src/index.js(1,10): error TS2322: Type error' });
      });

      fs.readFile.mockResolvedValue('const x = 1;');
      fs.writeFile.mockResolvedValue(undefined);
      mockGenerateContent.mockResolvedValue({
        response: { text: () => 'const x = 2;' }
      });

      const maxRetries = 2;
      const success = await runSelfHealing('npm run build', maxRetries);

      expect(success).toBe(false);
      expect(exec).toHaveBeenCalledTimes(maxRetries + 1); // Initial run + 2 retries
    });
  });
});