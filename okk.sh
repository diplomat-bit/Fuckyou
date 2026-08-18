#!/bin/bash

echo "==== RUNNING COMPILATION AND BUILD WITH SELF-HEALING ===="

MAX_ATTEMPTS=7
ATTEMPT=1
BUILD_SUCCESS=false

while [ $ATTEMPT -le $MAX_ATTEMPTS ]; do
  echo "----------------------------------------------------"
    echo "Build attempt #$ATTEMPT..."
      
        # Initialize or empty log
          > build.log
            
              # Execute build and safely capture standard outputs and system faults
                npm run build > build.log 2>&1
                  BUILD_STATUS=$?
                    
                      # Ensure output log is visible in the GH Actions console
                        cat build.log

                          if [ $BUILD_STATUS -eq 0 ]; then
                              echo "Build succeeded on attempt #$ATTEMPT!"
                                  BUILD_SUCCESS=true
                                      break
                                        fi

                                          echo "Build failed. Inspecting errors to heal dependencies..."
                                            
                                              if [ -z "$GEMINI_API_KEY" ]; then
                                                  echo "Error: GEMINI_API_KEY secret is missing. Cannot proceed with self-healing."
                                                      exit 1
                                                        fi

                                                          # Check if the log file is empty
                                                            if [ ! -s build.log ]; then
                                                                echo "Vite or NPM failed silently with an empty log output. Generating structural check..."
                                                                    ERROR_LOG="Process exited with code $BUILD_STATUS. Build output was completely blank. Check package.json scripts or vite configuration rules."
                                                                      else
                                                                          ERROR_LOG=$(tail -n 40 build.log)
                                                                            fi

                                                                              export EXPORTED_ERROR_LOG="$ERROR_LOG"

                                                                                # Execute the API payload generation and catch execution errors
                                                                                  REPAIR_DATA=$(node -e '
                                                                                    const apiKey = process.env.GEMINI_API_KEY;
                                                                                      const errorLog = process.env.EXPORTED_ERROR_LOG;
                                                                                        
                                                                                          const prompt = `You are an automated self-healing pipeline fixing an app build. The compilation step just crashed with this output:\n---\n${errorLog}\n---\nIdentify if a file or module resolution path is missing (e.g., could not resolve something from a component file). Generate the exact valid UI component file structure or mock needed to fill that dependency hole.\n\nYou MUST respond with a single, unquoted, clean JSON structure matching this exact format:\n{\n  "filePath": "components/Typography.tsx",\n  "content": "import React from \"react\";\\nexport const Typography = ({ children }: { children: React.ReactNode }) => <>{children}</>;\\nexport default Typography;"\n}\nDo not wrap the text in markdown arrays, backticks, or write any prose. Return raw clean JSON string object.`;
                                                                                          
                                                                                            fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
                                                                                                    method: "POST",
                                                                                                        headers: { "Content-Type": "application/json" },
                                                                                                            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
                                                                                            })
                                                                                              .then(res => {
                                                                                                    if (!res.ok) throw new Error("API responded with status code " + res.status);
                                                                                                        return res.json();
                                                                                              })
                                                                                                .then(data => {
                                                                                                        if (!data.candidates || data.candidates.length === 0) {
                                                                                                                  throw new Error("No resolution options returned from model metadata.");
                                                                                                        }
                                                                                                            const reply = data.candidates[0].content.parts[0].text.trim().replace(/^```json/, "").replace(/```$/, "").trim();
                                                                                                                console.log(reply);
                                                                                                })
                                                                                                  .catch(err => {
                                                                                                        console.log(JSON.stringify({ error: true, message: err.message }));
                                                                                                  });
                                                                                                    ')

                                                                                                      # Validate that REPAIR_DATA is not empty
                                                                                                        if [ -z "$REPAIR_DATA" ]; then
                                                                                                            echo "Error: REPAIR_DATA execution returned an empty string."
                                                                                                                exit 1
                                                                                                                  fi

                                                                                                                    # Safe parsing: Use a single node process to build our sanitized internal structure
                                                                                                                      PARSED_DATA=$(echo "$REPAIR_DATA" | node -e '
                                                                                                                          try {
                                                                                                                                  const raw = process.stdin.read();
                                                                                                                                        if (!raw) {
                                                                                                                                                    console.log(JSON.stringify({ error: true, message: "Standard input stream was empty" }));
                                                                                                                                                            process.exit(0);
                                                                                                                                        }
                                                                                                                                              const data = JSON.parse(raw);
                                                                                                                                                    if (data.error) {
                                                                                                                                                                console.log(JSON.stringify({ error: true, message: data.message }));
                                                                                                                                                    } else {
                                                                                                                                                                console.log(JSON.stringify({ error: false, filePath: data.filePath || "", content: data.content || "" }));
                                                                                                                                                    }
                                                                                                                          } catch (e) {
                                                                                                                                  console.log(JSON.stringify({ error: true, message: "Failed to parse JSON string: " + e.message }));
                                                                                                                          }
                                                                                                                            ')

                                                                                                                              # Completely hardened fallback evaluation to eliminate the null property crash
                                                                                                                                IS_ERROR=$(echo "$PARSED_DATA" | node -e '
                                                                                                                                    const raw = process.stdin.read();
                                                                                                                                        const d = raw ? JSON.parse(raw) : null;
                                                                                                                                            console.log(d ? d.error : true);
                                                                                                                                              ')

                                                                                                                                                if [ "$IS_ERROR" = "true" ]; then
                                                                                                                                                    ERR_MSG=$(echo "$PARSED_DATA" | node -e '
                                                                                                                                                          const raw = process.stdin.read();
                                                                                                                                                                const d = raw ? JSON.parse(raw) : null;
                                                                                                                                                                      console.log(d ? d.message : "Unknown structural stream crash");
                                                                                                                                                                          ')
                                                                                                                                                                              echo "Pipeline alignment error: $ERR_MSG"
                                                                                                                                                                                  echo "Raw Response Received: $REPAIR_DATA"
                                                                                                                                                                                      exit 1
                                                                                                                                                                                        fi

                                                                                                                                                                                          # Safe variables extractions with strict fallback definitions
                                                                                                                                                                                            TARGET_FILE=$(echo "$PARSED_DATA" | node -e '
                                                                                                                                                                                                const raw = process.stdin.read();
                                                                                                                                                                                                    const d = raw ? JSON.parse(raw) : null;
                                                                                                                                                                                                        console.log(d && d.filePath ? d.filePath : "");
                                                                                                                                                                                                          ')
                                                                                                                                                                                                            FILE_CONTENT=$(echo "$PARSED_DATA" | node -e '
                                                                                                                                                                                                                const raw = process.stdin.read();
                                                                                                                                                                                                                    const d = raw ? JSON.parse(raw) : null;
                                                                                                                                                                                                                        console.log(d && d.content ? d.content : "");
                                                                                                                                                                                                                          ')

                                                                                                                                                                                                                            if [ -n "$TARGET_FILE" ] && [ -n "$FILE_CONTENT" ]; then
                                                                                                                                                                                                                                mkdir -p "$(dirname "$TARGET_FILE")"
                                                                                                                                                                                                                                    echo "$FILE_CONTENT" > "$TARGET_FILE"
                                                                                                                                                                                                                                        echo "Successfully healed asset path: $TARGET_FILE"
                                                                                                                                                                                                                                          else
                                                                                                                                                                                                                                              echo "Parsed fields were empty strings. Retrying alignment sequence..."
                                                                                                                                                                                                                                                fi

                                                                                                                                                                                                                                                  ATTEMPT=$((ATTEMPT + 1))
                                                                                                                                                                                                                                                  done

                                                                                                                                                                                                                                                  if [ "$BUILD_SUCCESS" = false ]; then
                                                                                                                                                                                                                                                    echo "Application layout could not automatically restore after $MAX_ATTEMPTS structural patches."
                                                                                                                                                                                                                                                      exit 1
                                                                                                                                                                                                                                                      f
                                                                                                                          }
                                                                                                                                                    }
                                                                                                                                                    }
                                                                                                                                        }
                                                                                                                          })
                                                                                                  })
                                                                                                        }
                                                                                                })
                                                                                              })
                                                                                            }))