<script lang="ts">
	import Modal from "$lib/components/Modal.svelte";

</script>


<nav class="bg-gray-800 px-2 h-16 flex-x">
  <div class="flex-x">
    <a class="x-link" href="/" >
      Home
    </a>
    <a class="x-link">
      bla
    </a>
    <span class="w-[1px] h-12 bg-gray-500 rounded-xl">

    </span>
    <a class="x-link" >
      Map
    </a>
    <Modal showCloseButton={true}>
      <span class="x-link cursor-pointer" slot="entry">
        bla
      </span>
      <div>
        bla
      </div>
    </Modal>
    
  </div>
</nav>



  

 