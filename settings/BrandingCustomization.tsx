import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Typography,
  Box,
  Grid,
  Paper,
  Avatar,
  FormControlLabel,
  Switch,
  InputLabel,
  MenuItem,
  Select,
  FormControl,
  CircularProgress,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ColorPicker from 'react-best-color-picker';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

const BrandingCustomization = () => {
  const [appName, setAppName] = useState('Your App Name');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState('#1976d2');
  const [secondaryColor, setSecondaryColor] = useState('#9c27b0');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [textColor, setTextColor] = useState('#000000');
  const [fontFamily, setFontFamily] = useState('Roboto, sans-serif');
  const [darkMode, setDarkMode] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    // Load saved branding settings if available
    const savedSettings = localStorage.getItem('appBrandingSettings');
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings);
      setAppName(parsedSettings.appName || 'Your App Name');
      setLogoPreview(parsedSettings.logoPreview || null);
      setPrimaryColor(parsedSettings.primaryColor || '#1976d2');
      setSecondaryColor(parsedSettings.secondaryColor || '#9c27b0');
      setBackgroundColor(parsedSettings.backgroundColor || '#ffffff');
      setTextColor(parsedSettings.textColor || '#000000');
      setFontFamily(parsedSettings.fontFamily || 'Roboto, sans-serif');
      setDarkMode(parsedSettings.darkMode || false);
    }
  }, []);

  const handleAppNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAppName(event.target.value);
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleColorChange = (color: string, type: string) => {
    switch (type) {
      case 'primary':
        setPrimaryColor(color);
        break;
      case 'secondary':
        setSecondaryColor(color);
        break;
      case 'background':
        setBackgroundColor(color);
        break;
      case 'text':
        setTextColor(color);
        break;
      default:
        break;
    }
  };

  const handleFontFamilyChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setFontFamily(event.target.value as string);
  };

  const handleDarkModeToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDarkMode(event.target.checked);
  };

  const handleSaveBranding = () => {
    const brandingSettings = {
      appName,
      logoPreview,
      primaryColor,
      secondaryColor,
      backgroundColor,
      textColor,
      fontFamily,
      darkMode,
    };
    localStorage.setItem('appBrandingSettings', JSON.stringify(brandingSettings));
    alert('Branding settings saved!');
    // In a real application, you would also send these settings to a backend API
  };

  const handleResetBranding = () => {
    setAppName('Your App Name');
    setLogoFile(null);
    setLogoPreview(null);
    setPrimaryColor('#1976d2');
    setSecondaryColor('#9c27b0');
    setBackgroundColor('#ffffff');
    setTextColor('#000000');
    setFontFamily('Roboto, sans-serif');
    setDarkMode(false);
    localStorage.removeItem('appBrandingSettings');
    alert('Branding settings reset to default!');
  };

  const handleGenerateWithAI = async () => {
    setIsGenerating(true);
    const applyFallbackTheme = (errorMessage: string) => {
      alert(`${errorMessage}. Applying a default AI-generated theme.`);
      setAppName("Quantum Finance");
      setPrimaryColor("#4A90E2");
      setSecondaryColor("#50E3C2");
      setBackgroundColor("#F5F7FA");
      setTextColor("#333333");
    };

    try {
      const response = await fetch('https://ce47fe80-dabc-4ad0-b0e7-cf285695b8b8.mock.pstmn.io/ai/advisor/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'Generate a branding concept for a new financial app. I need an appName (string), a primaryColor (hex string), a secondaryColor (hex string), a backgroundColor (hex string for light mode), and a textColor (hex string for light mode). Please respond with ONLY a valid JSON object containing these keys.',
          sessionId: `branding-gen-${Date.now()}`
        }),
      });

      if (!response.ok) {
        throw new Error(`AI generation failed with status: ${response.status}`);
      }

      const data = await response.json();
      
      let brandingJSON;
      try {
        const jsonMatch = data.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          brandingJSON = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("No JSON object found in AI response.");
        }
      } catch (e) {
        console.error("Failed to parse AI response:", data.text, e);
        applyFallbackTheme('AI response was not in the expected JSON format');
        setIsGenerating(false);
        return;
      }

      if (brandingJSON.appName) setAppName(brandingJSON.appName);
      if (brandingJSON.primaryColor) setPrimaryColor(brandingJSON.primaryColor);
      if (brandingJSON.secondaryColor) setSecondaryColor(brandingJSON.secondaryColor);
      if (brandingJSON.backgroundColor) setBackgroundColor(brandingJSON.backgroundColor);
      if (brandingJSON.textColor) setTextColor(brandingJSON.textColor);
      
      alert('AI-powered branding applied!');

    } catch (error: any) {
      console.error('Error generating branding with AI:', error);
      applyFallbackTheme(`Failed to generate branding: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const availableFonts = [
    { label: 'Roboto', value: 'Roboto, sans-serif' },
    { label: 'Open Sans', value: 'Open Sans, sans-serif' },
    { label: 'Lato', value: 'Lato, sans-serif' },
    { label: 'Montserrat', value: 'Montserrat, sans-serif' },
    { label: 'Merriweather', value: 'Merriweather, serif' },
  ];

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Branding Customization (AD57)
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Item>
            <Typography variant="h6" gutterBottom>
              General Settings
            </Typography>
            <TextField
              label="App Name"
              value={appName}
              onChange={handleAppNameChange}
              fullWidth
              margin="normal"
            />
            <Box sx={{ mt: 2 }}>
              <FormControl fullWidth>
                <InputLabel id="font-family-label">Font Family</InputLabel>
                <Select
                  labelId="font-family-label"
                  id="font-family-select"
                  value={fontFamily}
                  label="Font Family"
                  onChange={handleFontFamilyChange}
                >
                  {availableFonts.map((font) => (
                    <MenuItem key={font.value} value={font.value}>
                      {font.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <FormControlLabel
              control={<Switch checked={darkMode} onChange={handleDarkModeToggle} />}
              label="Enable Dark Mode"
              sx={{ mt: 2, display: 'block' }}
            />
          </Item>
        </Grid>

        <Grid item xs={12} md={6}>
          <Item>
            <Typography variant="h6" gutterBottom>
              Logo
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
              {logoPreview ? (
                <Avatar src={logoPreview} sx={{ width: 100, height: 100, mb: 2 }} />
              ) : (
                <Avatar sx={{ width: 100, height: 100, bgcolor: 'grey.500', mb: 2 }}>
                  {appName.charAt(0).toUpperCase()}
                </Avatar>
              )}
              <Button variant="contained" component="label">
                Upload Logo
                <input type="file" hidden accept="image/*" onChange={handleLogoUpload} />
              </Button>
              {logoFile && (
                <Typography variant="caption" sx={{ mt: 1 }}>
                  {logoFile.name}
                </Typography>
              )}
            </Box>
          </Item>
        </Grid>

        <Grid item xs={12}>
          <Item>
            <Typography variant="h6" gutterBottom>
              Color Palette
            </Typography>
            <Grid container spacing={2} alignItems="center" justifyContent="center">
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="subtitle1">Primary Color</Typography>
                <ColorPicker
                  value={primaryColor}
                  onChange={(color) => handleColorChange(color, 'primary')}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="subtitle1">Secondary Color</Typography>
                <ColorPicker
                  value={secondaryColor}
                  onChange={(color) => handleColorChange(color, 'secondary')}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="subtitle1">Background Color</Typography>
                <ColorPicker
                  value={backgroundColor}
                  onChange={(color) => handleColorChange(color, 'background')}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="subtitle1">Text Color</Typography>
                <ColorPicker
                  value={textColor}
                  onChange={(color) => handleColorChange(color, 'text')}
                />
              </Grid>
            </Grid>
          </Item>
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleGenerateWithAI}
              disabled={isGenerating}
              sx={{ mr: 2 }}
              startIcon={isGenerating ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {isGenerating ? 'Generating...' : 'Generate with AI'}
            </Button>
            <Button variant="contained" color="primary" onClick={handleSaveBranding} sx={{ mr: 2 }}>
              Save Branding
            </Button>
            <Button variant="outlined" color="secondary" onClick={handleResetBranding}>
              Reset to Default
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BrandingCustomization;