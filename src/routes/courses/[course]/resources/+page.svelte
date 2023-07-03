<script lang="ts">
	import { allResources } from "$lib/client/stores";
	import ModalEntry from "$lib/components/ModalEntry.svelte";
	import PdfViewer from "$lib/components/PdfViewer.svelte";
	import UploadResource from "./UploadResource.svelte";



</script>


<div class="flex-col w-full h-full">
  <ModalEntry 
    Component={UploadResource}
  >
    <button>
      Add Resource
    </button>
  </ModalEntry>
  <ul>
    {#each $allResources as resource}
      <li>
        <ModalEntry Component={PdfViewer} {resource} scale={1.5} >
          <button>
            {resource.name}
          </button>
        </ModalEntry> 
      </li>
    {/each}
  </ul>
</div>