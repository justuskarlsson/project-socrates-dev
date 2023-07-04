<script lang="ts">
  import IoIosAddCircleOutline from 'svelte-icons/io/IoIosAddCircleOutline.svelte';
  import IoMdRemoveCircleOutline from 'svelte-icons/io/IoMdRemoveCircleOutline.svelte'
  import IoIosCloudUpload from 'svelte-icons/io/IoIosCloudUpload.svelte'

  type IconId = "add" | "remove" | "upload";

  export let icon: IconId;
  export let tooltip: string = "";
  export let float: "left" | "right" = "left";
  export let onClick: (event: MouseEvent) => void = () => {};

  function getIconComponent(id: IconId) {
    switch(id) {
      case "add": return IoIosAddCircleOutline;
      case "remove": return IoMdRemoveCircleOutline;
      case "upload": return IoIosCloudUpload;
    }
  }

</script>

<div
  class="group w-12 h-12 x-icon
          mx-0 bg-red-500 text-white {$$props.class}"
  on:click={onClick}
>
  <svelte:component this={getIconComponent(icon)}/>
  {#if tooltip}
    <span class="icon-tooltip group-hover:scale-100 "
          style="{float === "left" ? "left: -12px" : "right: 12px;"}"
    >
      {tooltip} 
    </span>
  {/if}
</div>


<style lang="postcss">
    .icon {
    @apply relative flex items-center justify-center
    h-12 w-12 mt-2 mb-2 mx-auto shadow-lg
    text-green-500 rounded-3xl p-1
    transition-all duration-300 ease-linear cursor-pointer;
  }

  .icon:hover, .icon.active {
    @apply bg-green-600 text-white rounded-xl;
  }

  /* .scale-0 {
    --tw-scale-x: 0;
    --tw-scale-y: 0;
    transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
  } */
  .icon-tooltip {
    --tw-translate-x: -100%;
    @apply absolute w-auto p-2 m-2 min-w-max 
    rounded-md shadow-md text-white bg-gray-900 
    text-xs font-bold transition-all duration-100
    origin-center scale-0; /* group-hover: scale-100 */ 
  }
</style>