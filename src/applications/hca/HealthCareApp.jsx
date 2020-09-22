import React from 'react';

import RoutedSavableApp from 'platform/forms/save-in-progress/RoutedSavableApp';
import formConfig from './config/form';

export default function HealthCareEntry({ location, children }) {
  console.log('Children inside HealthCareEntry ------ ', children);
  return (
    <RoutedSavableApp
      formConfig={formConfig}
      currentLocation={location}
      children={children}
    >
      {children}
    </RoutedSavableApp>
  );
}
