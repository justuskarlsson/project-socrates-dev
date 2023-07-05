<script lang="ts">

  export let visible: boolean = false; 

  function toggleVisible(){
    visible = !visible;
  }

</script>

<div on:click={toggleVisible}>
  <slot name="entry">
    <button>open</button>
  </slot>
</div>
{#if visible}
   <slot />
{/if}