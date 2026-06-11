import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Menu, MenuButton, MenuList, MenuItem } from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
];

export const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();
  const [currentLang, setCurrentLang] = useState(i18n.language || 'en');

  const changeLanguage = (lng) => {
    console.log('Changing to:', lng);
    i18n.changeLanguage(lng);
    setCurrentLang(lng);
    localStorage.setItem('i18nextLng', lng);
  };

  const currentLanguage = languages.find(lang => lang.code === currentLang) || languages[0];

  return (
    <Menu>
      <MenuButton as={Button} rightIcon={<ChevronDownIcon />} size="sm" variant="outline">
        {currentLanguage.flag} {currentLanguage.name}
      </MenuButton>
      <MenuList>
        {languages.map((lang) => (
          <MenuItem
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            bg={currentLang === lang.code ? 'blue.500' : 'transparent'}
            color={currentLang === lang.code ? 'white' : 'inherit'}
          >
            {lang.flag} {lang.name}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};