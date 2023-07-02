<script lang="ts">
	let canvas: HTMLCanvasElement;
	import pdfJs, { type PDFDocumentProxy } from 'pdfjs-dist';

	// If absolute URL from the remote server is provided, configure the CORS
	// header on that server.
	var url =
		'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/examples/learning/helloworld.pdf';
  
  let pageIdx = 0;

	// The workerSrc property shall be specified.
	pdfJs.GlobalWorkerOptions.workerSrc = new URL(
		'pdfjs-dist/build/pdf.worker.js',
		import.meta.url
	).toString();

	async function loadLocal(file: File) : Promise<PDFDocumentProxy> {
		// let file = el.files && el.files[0];
		return new Promise((resolve, reject) => {
		  if (!file) reject();

			var fileReader = new FileReader();
			fileReader.onload = function () {
				let result = this.result;
				var typedarray = new Uint8Array(result as ArrayBuffer);

				const loadingTask = pdfJs.getDocument(typedarray);
				loadingTask.promise
					.then((pdf) => {
						resolve(pdf);
					})
					.catch(reject);
			};

			fileReader.onerror = function (error) {
				reject(error);
			};

			fileReader.readAsArrayBuffer(file as File);
		});
	}

  async function onChange(e: Event) {
    let target = e.target as HTMLInputElement;
    let file = target.files && target.files[0];
    if (!file) return;
    let doc = await loadLocal(file);
    let page = await doc.getPage(pageIdx);
  }
</script>
<input type="file" on:change={onChange} />
<canvas bind:this={canvas} />
