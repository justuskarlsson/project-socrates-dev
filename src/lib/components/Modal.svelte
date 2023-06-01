<script lang="ts">
  export let label: string;
  export let modalId: string = "my-modal";
</script>

<style>

</style>


<slot name="entry">
  <label for={modalId} class="btn">{label}</label>
</slot>

<input type="checkbox" id={modalId} class="modal-toggle" />
<label for={modalId} class="modal cursor-pointer">
  <div class="modal-box">
    <slot>
      Modal Content
    </slot>
  </div>
</label>
