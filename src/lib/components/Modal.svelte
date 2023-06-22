<script lang="ts">
  export let showCloseButton = false;
  let visible = false;
  import IoMdClose from 'svelte-icons/io/IoMdClose.svelte'
  function show(){
    visible = true;
  }

  function hide(){
    visible = false;
  }

</script>

<style>

</style>

<div class="" on:click={show}>
  <slot name="entry">
    <button class="btn" >Open Modal</button>
  </slot>
</div>
{#if visible}
  <div class="fixed inset-0 flex space-x-0 items-center justify-center z-50
              cursor-pointer" 
       style="background-color: rgba(0, 0, 0, 0.5);"
       on:click={hide}
       >
    <div class="bg-white p-8 rounded-lg shadow-lg
                relative w-full h-full cursor-auto
                sm:h-5/6 md:h-3/4 lg:h-1/2 xl:h-2/6
                sm:w-5/6 md:w-3/4 lg:w-1/2 xl:w-2/6"
      on:click={()=>{}}
    >
      <slot>
        Modal Content
      </slot>
      {#if showCloseButton}
         <button class="absolute top-2 right-2 text-gray-800 w-8 h-8" 
                 on:click={hide}
           >
           <IoMdClose />
         </button>
      {/if}
    </div>
  </div>
{/if}