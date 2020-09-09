import Hello from './hello';
import VetsCss from './applications/proxy-rewrite/sass/style-consolidated.scss';
// import "bootstrap/dist/css/bootstrap.css";
// import PageNotFound from "./components/PageNotFound";
// import Layout from "./components/layouts/Layout";
// export { HelloWorld, PageNotFound, Layout };
import { RoutedSavablePage } from './platform/forms/save-in-progress/RoutedSavablePage';
import { RoutedSavableReviewPage } from './platform/forms/save-in-progress/RoutedSavableReviewPage';
export default { RoutedSavablePage, Hello, RoutedSavableReviewPage, VetsCss };
