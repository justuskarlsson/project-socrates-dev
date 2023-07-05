<script lang="ts">

  export let visible: boolean = false; 

  let hasBeenVisible = false;

  function toggleVisible(){
    hasBeenVisible = true;
    visible = !visible;
  }

</script>

<div on:click={toggleVisible}>
  <slot name="entry">
    <button>open</button>
  </slot>
</div>
{#if visible || hasBeenVisible}
  <div class:hidden={!visible}>
    <slot />
  </div> 
{/if}