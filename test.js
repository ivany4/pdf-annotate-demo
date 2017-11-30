import PDFJS from 'pdfjs-dist';
import './pdf-annotate-missing/pdf_viewer';
import PDFJSAnnotate from 'pdf-annotate';
import initColorPicker from './pdf-annotate-missing/initColorPicker';
//const pdfViewer = require('pdfjs-dist/web/pdf_viewer');
//PDFJS.DefaultTextLayerFactory = () => {};//pdfViewer.DefaultTextLayerFactory;



const { UI, LocalStoreAdapter } = PDFJSAnnotate;
const RENDER_OPTIONS = {
  documentId: 'https://cdn.mozilla.net/pdfjs/helloworld.pdf',
  pdfDocument: null,
  scale: parseFloat(localStorage.getItem('${documentId}/scale'), 10) || 1.33,
  rotate: parseInt(localStorage.getItem('${documentId}/rotate'), 10) || 0
};
const storeAdapter = new LocalStoreAdapter();
const VIEWER = document.getElementById('viewer');
PDFJS.workerSrc = 'https://mozilla.github.io/pdf.js/build/pdf.worker.js';
PDFJSAnnotate.setStoreAdapter(storeAdapter);

function render() {
    PDFJS.getDocument(RENDER_OPTIONS.documentId).then((pdf) => {
      RENDER_OPTIONS.pdfDocument = pdf;
      NUM_PAGES = pdf.pdfInfo.numPages;
      VIEWER.appendChild(UI.createPage(1));
        UI.renderPage(1, RENDER_OPTIONS).then((pdfPage, annotations) => {
            console.log("Annotations: " + JSON.stringify(annotations))
        });
        UI.enableEdit();
        //UI.createEditOverlay(VIEWER);
    });
}
render();

// Text stuff
(function () {
  let textSize;
  let textColor;

  function initText() {
    let size = document.querySelector('.toolbar .text-size');
    [8, 9, 10, 11, 12, 14, 18, 24, 30, 36, 48, 60, 72, 96].forEach((s) => {
      size.appendChild(new Option (s, s));
    });

    setText(
      localStorage.getItem('${RENDER_OPTIONS.documentId}/text/size') || 10,
      localStorage.getItem('${RENDER_OPTIONS.documentId}/text/color') || '#000000'
    );

    initColorPicker(document.querySelector('.text-color'), textColor, function (value) {
      setText(textSize, value);
    });
  }

  function setText(size, color) {
    let modified = false;

    if (textSize !== size) {
      modified = true;
      textSize = size;
      localStorage.setItem('${RENDER_OPTIONS.documentId}/text/size', textSize);
      document.querySelector('.toolbar .text-size').value = textSize;
    }

    if (textColor !== color) {
      modified = true;
      textColor = color;
      localStorage.setItem('${RENDER_OPTIONS.documentId}/text/color', textColor);

      let selected = document.querySelector('.toolbar .text-color.color-selected');
      if (selected) {
        selected.classList.remove('color-selected');
        selected.removeAttribute('aria-selected');
      }

      selected = document.querySelector('.toolbar .text-color[data-color="${color}"]');
      if (selected) {
        selected.classList.add('color-selected');
        selected.setAttribute('aria-selected', true);
      }

    }

    if (modified) {
      UI.setText(textSize, textColor);
    }
  }

  function handleTextSizeChange(e) {
    setText(e.target.value, textColor);
  }

  document.querySelector('.toolbar .text-size').addEventListener('change', handleTextSizeChange);

  initText();
})();

// Pen stuff
(function () {
  let penSize;
  let penColor;

  function initPen() {
    let size = document.querySelector('.toolbar .pen-size');
    for (let i=0; i<20; i++) {
      size.appendChild(new Option(i+1, i+1));
    }

    setPen(
      localStorage.getItem('${RENDER_OPTIONS.documentId}/pen/size') || 1,
      localStorage.getItem('${RENDER_OPTIONS.documentId}/pen/color') || '#000000'
    );

    initColorPicker(document.querySelector('.pen-color'), penColor, function (value) {
      setPen(penSize, value);
    });
  }

  function setPen(size, color) {
    let modified = false;

    if (penSize !== size) {
      modified = true;
      penSize = size;
      localStorage.setItem('${RENDER_OPTIONS.documentId}/pen/size', penSize);
      document.querySelector('.toolbar .pen-size').value = penSize;
    }

    if (penColor !== color) {
      modified = true;
      penColor = color;
      localStorage.setItem('${RENDER_OPTIONS.documentId}/pen/color', penColor);

      let selected = document.querySelector('.toolbar .pen-color.color-selected');
      if (selected) {
        selected.classList.remove('color-selected');
        selected.removeAttribute('aria-selected');
      }

      selected = document.querySelector('.toolbar .pen-color[data-color="${color}"]');
      if (selected) {
        selected.classList.add('color-selected');
        selected.setAttribute('aria-selected', true);
      }
    }

    if (modified) {
      UI.setPen(penSize, penColor);
    }
  }

  function handlePenSizeChange(e) {
    setPen(e.target.value, penColor);
  }

  document.querySelector('.toolbar .pen-size').addEventListener('change', handlePenSizeChange);

  initPen();
})();

// Toolbar buttons
let tooltype = localStorage.getItem('${RENDER_OPTIONS.documentId}/tooltype') || 'cursor'; // document.getElementsByClassName("highlight")["0"].dataset.tooltype
if (tooltype) {
    setActiveToolbarItem(tooltype, document.querySelector('.toolbar button[data-tooltype=' + tooltype + ']'));
}

function setActiveToolbarItem(type, button) {
    let active = document.querySelector('.toolbar button.active');
    if (active) {
      active.classList.remove('active');

      switch (tooltype) {
	case 'cursor':
	  UI.disableEdit();
	  break;
	case 'draw':
	  UI.disablePen();
	  break;
	case 'text':
	  UI.disableText();
	  break;
	case 'point':
	  UI.disablePoint();
	  break;
	case 'area':
	case 'highlight':
	case 'strikeout':
	  UI.disableRect();
	  break;
      }
    }

    if (button) {
	button.classList.add('active');
    }
    if (tooltype !== type) {
	localStorage.setItem('${RENDER_OPTIONS.documentId}/tooltype', type);
    }
    tooltype = type;

    switch (type) {
      case 'cursor':
        UI.enableEdit();
        break;
      case 'draw':
        UI.enablePen();
        break;
      case 'text':
        UI.enableText();
        break;
      case 'point':
        UI.enablePoint();
        break;
      case 'area':
      case 'highlight':
      case 'strikeout':
        UI.enableRect(type);
        break;
    }
}

function handleToolbarClick(e) {
    if (e.target.nodeName === 'BUTTON') {
      setActiveToolbarItem(e.target.getAttribute('data-tooltype'), e.target);
    }
}

document.querySelector('.toolbar').addEventListener('click', handleToolbarClick);

// Scale/rotate
(function () {
  function setScaleRotate(scale, rotate) {
    scale = parseFloat(scale, 10);
    rotate = parseInt(rotate, 10);

    if (RENDER_OPTIONS.scale !== scale || RENDER_OPTIONS.rotate !== rotate) {
      RENDER_OPTIONS.scale = scale;
      RENDER_OPTIONS.rotate = rotate;

      localStorage.setItem('${RENDER_OPTIONS.documentId}/scale', RENDER_OPTIONS.scale);
      localStorage.setItem('${RENDER_OPTIONS.documentId}/rotate', RENDER_OPTIONS.rotate % 360);
      
      render();

    }
  }

  function handleScaleChange(e) {
    setScaleRotate(e.target.value, RENDER_OPTIONS.rotate);
  }

  function handleRotateCWClick() {
    setScaleRotate(RENDER_OPTIONS.scale, RENDER_OPTIONS.rotate + 90);
  }

  function handleRotateCCWClick() {
    setScaleRotate(RENDER_OPTIONS.scale, RENDER_OPTIONS.rotate - 90);
  }

  document.querySelector('.toolbar select.scale').value = RENDER_OPTIONS.scale;
  document.querySelector('.toolbar select.scale').addEventListener('change', handleScaleChange);
  document.querySelector('.toolbar .rotate-ccw').addEventListener('click', handleRotateCCWClick);
  document.querySelector('.toolbar .rotate-cw').addEventListener('click', handleRotateCWClick);
})();

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
