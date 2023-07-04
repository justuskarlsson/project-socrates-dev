<script lang="ts" context="module">
  // export interface Input {
  //   name: string;
  //   default: any;
  //   [x: string]: any;
  // };
  class Input<T> {
    label: string;
    value: T;
    constructor(label: string, value: T) {
      this.label = label;
      this.value = value;
    }
    onChange(event: Event) {

    }
  };
  export class TextInput extends Input<string> {
    constructor(label: string, value: string = "") {
      super(label, value);
    }
  };

  type Option = {value: string, label: string};
  export class SelectInput extends Input<string> {
    options: Option[];
    constructor(label: string, options: Option[], value: string = "") {
      super(label, value === "" ? options[0].value : value);
      this.options = options;
    }
  };

  export class FormData {
    inputs: Record<string, Input<any>>;
    onSubmit: Function;
    constructor(inputs: Record<string, Input<any>>, onSubmit: Function) {
      this.inputs = inputs;
      this.onSubmit = onSubmit;
    }
  };
</script>

<script lang="ts">
	import { closeModal } from "./ModalView.svelte";

  export let data: FormData;
  function onSubmit(){
    let values: Record<string, any> = {};
    Object.entries(data.inputs).map(([key, input]) => {
      values[key] = input.value;
    })
    data.onSubmit(values);
    closeModal();
  }
</script>


<div class="w-full h-full bg-white flex flex-col p-4 space-y-2">
  {#each Object.values(data.inputs) as input}
    <div>
      {#if input instanceof SelectInput}
        <label class="label">
          <span class="label-text">{input.label}:</span>
        </label>
        <select class="select select-bordered
                       w-full max-w-xs"
                bind:value={input.value}
          >
          {#each input.options as option}
            <option value={option.value}>
              {option.label}
            </option>
          {/each}
        </select>
      {:else}
         <label class="label">
           <span class="label-text">{input.label}:</span>
         </label>
         <input type="text" placeholder="Type here" 
                class="input input-bordered"
                bind:value={input.value}
                />
      {/if}
    </div>
  {/each}
  <button class="btn" on:click={onSubmit}>
    Submit
  </button>
</div>


<style>

</style>