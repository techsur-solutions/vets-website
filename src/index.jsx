import Hello from './hello';
import VetsCss from './applications/proxy-rewrite/sass/style-consolidated.scss';

import { RoutedSavablePage } from './platform/forms/save-in-progress/RoutedSavablePage';

import { RoutedSavableApp } from './platform/forms/save-in-progress/RoutedSavableApp';
import { RoutedSavableReviewPage } from './platform/forms/save-in-progress/RoutedSavableReviewPage';
import { formConfig } from './applications/hca/config/form';
import { FormNav } from './platform/forms-system/src/js/components/FormNav';
import {createRoutesWithSaveInProgress} from './platform/forms/save-in-progress/helpers';
import {startApp}  from './platform/startup';
import {createSaveInProgressFormReducer}  from './platform/forms/save-in-progress/reducers';

import reducers from 'platform/forms-system/src/js/state/reducers';

import { FormPage } from './platform/forms-system/src/js/containers/FormPage';

export default {
  RoutedSavablePage,
  Hello,
  RoutedSavableReviewPage,
  VetsCss,
  formConfig,
  RoutedSavableApp,
  FormNav,
  FormPage,
  createRoutesWithSaveInProgress,
  reducers,
  startApp,
  createSaveInProgressFormReducer
};
