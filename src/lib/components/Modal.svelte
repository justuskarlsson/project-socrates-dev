<script lang="ts">
  let visible = false;
</script>

<style>

</style>

<div class="" on:click={()=> visible=true}>
  <slot name="entry">
    <button class="btn" >Open Modal</button>
  </slot>
</div>
{#if visible}
  <div class="fixed inset-0 flex space-x-0 items-center justify-center z-50" 
       style="background-color: rgba(0, 0, 0, 0.5);">
    <div class="bg-white p-8 rounded-lg shadow-lg
                relative w-full h-full 
                sm:h-3/4 md:h-1/2 lg:h-1/3 xl:h-1/4
                sm:w-3/4 md:w-1/2 lg:w-1/3 xl:w-1/4">
      <slot>
        Modal Content
      </slot>
      <button class="absolute top-2 right-2" on:click={()=> visible=false}>X</button>
    </div>
  </div>
{/if}