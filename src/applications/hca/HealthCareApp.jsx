import React from 'react';

import RoutedSavableApp from 'platform/forms/save-in-progress/RoutedSavableApp';
//import formConfig from './config/form';

export default function HealthCareEntry({ location, children,formConfig }) {
  console.log("HealthCareEntry  location ************    ",location);
  console.log("HealthCareEntry  children ************    ",children);
  console.log("HealthCareEntry  formConfig ************    ",formConfig);
  return (
    <RoutedSavableApp formConfig={formConfig} currentLocation={location}>
      {children}
    </RoutedSavableApp>
   
  );
}
