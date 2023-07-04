import * as pdfJs from 'pdfjs-dist';

pdfJs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.js',
  import.meta.url
).toString();