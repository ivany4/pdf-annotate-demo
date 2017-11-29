import PDFJS from 'pdfjs-dist';
import './pdf-annotate-missing/pdf_viewer';
import PDFJSAnnotate from 'pdf-annotate';
//const pdfViewer = require('pdfjs-dist/web/pdf_viewer');
//PDFJS.DefaultTextLayerFactory = () => {};//pdfViewer.DefaultTextLayerFactory;

const { UI, LocalStoreAdapter } = PDFJSAnnotate;
const RENDER_OPTIONS = {
  documentId: 'https://cdn.mozilla.net/pdfjs/helloworld.pdf',
  pdfDocument: null,
  scale: 1,
  rotate: 0
};
const storeAdapter = new LocalStoreAdapter();
const VIEWER = document.getElementById('viewer');
PDFJS.workerSrc = 'https://mozilla.github.io/pdf.js/build/pdf.worker.js';
PDFJSAnnotate.setStoreAdapter(storeAdapter);

PDFJS.getDocument(RENDER_OPTIONS.documentId).then((pdf) => {
  RENDER_OPTIONS.pdfDocument = pdf;
  VIEWER.appendChild(UI.createPage(1));
    UI.renderPage(1, RENDER_OPTIONS).then((pdfPage, annotations) => {
        console.log("Annotations: " + JSON.stringify(annotations))
    });
    UI.enableEdit();
    //UI.createEditOverlay(VIEWER);
});
/*

// If absolute URL from the remote server is provided, configure the CORS
// header on that server.
var url = '//cdn.mozilla.net/pdfjs/helloworld.pdf';

// Disable workers to avoid yet another cross-origin issue (workers need
// the URL of the script to be loaded, and dynamically loading a cross-origin
// script does not work).
// PDFJS.disableWorker = true;

// The workerSrc property shall be specified.
PDFJS.workerSrc = '//mozilla.github.io/pdf.js/build/pdf.worker.js';

// Asynchronous download of PDF
var loadingTask = PDFJS.getDocument(url);
loadingTask.promise.then(function(pdf) {
  console.log('PDF loaded');
  
  // Fetch the first page
  var pageNumber = 1;
  pdf.getPage(pageNumber).then(function(page) {
    console.log('Page loaded');
    
    var scale = 1.5;
    var viewport = page.getViewport(scale);

    // Prepare canvas using PDF page dimensions
    var canvas = document.getElementById('viewer');
    var context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    // Render PDF page into canvas context
    var renderContext = {
      canvasContext: context,
      viewport: viewport
    };
    var renderTask = page.render(renderContext);
    renderTask.then(function () {
      console.log('Page rendered');
    });
  });
}, function (reason) {
  // PDF loading error
  console.error(reason);
});// */
