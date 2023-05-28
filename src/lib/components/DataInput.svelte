<script lang="ts">
  export let onData: Function;
  export let label: string;

  let raw = "";
  function parseData(){
    let json = JSON.parse(raw);
    raw = "";
    onData(json);
  }
</script>

<style>

</style>


<label for="my-modal" class="btn">{label}</label>
<input type="checkbox" id="my-modal" class="modal-toggle" />
<div class="modal">
  <div class="modal-box">
    <div class="flex flex-col"
  >
    <textarea class="textarea textarea-info textarea-md 
      text-base mt-auto" 
    placeholder="JSON data" 
      bind:value={raw} />
    <label for="my-modal" class="btn" on:click={parseData}>
      ENTER
    </label>
    </div>
  </div>
</div>
