import type * as tf from '@tensorflow/tfjs';


export async function minEuclideanDist(input: tf.Tensor1D, ref: tf.Tensor2D) :
   Promise<number> 
{
  let distances = (ref.sub(input.expandDims(0))).euclideanNorm(1);
  let idx = await distances.argMin().array();
  return idx as number;
}


export async function euclideanDists(input: tf.Tensor1D, ref: tf.Tensor2D) :
   Promise<number[]> 
{
  let distances = (ref.sub(input.expandDims(0))).euclideanNorm(1);
  let arr = await distances.array();
  return arr as number[];
}


export async function pairwiseCosineDist(ref: tf.Tensor2D) :
   Promise<number[][]> 
{
  let distances = ref.matMul(ref.transpose());
  distances.print();
  let arr = await distances.array();
  return arr as number[][];
}