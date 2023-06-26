import * as tf from '@tensorflow/tfjs';


export async function minEuclideanDist(input: tf.Tensor1D, ref: tf.Tensor2D):
  Promise<number> {
  let distances = (ref.sub(input.expandDims(0))).euclideanNorm(1);
  let idx = await distances.argMin().array();
  return idx as number;
}


export async function euclideanDists(input: tf.Tensor1D, ref: tf.Tensor2D):
  Promise<number[]> {
  let distances = (ref.sub(input.expandDims(0))).euclideanNorm(1);
  let arr = await distances.array();
  return arr as number[];
}


export async function pairwiseCosineDist(ref: tf.Tensor2D):
  Promise<number[][]> {
  let distances = ref.matMul(ref.transpose());
  distances.print();
  let arr = await distances.array();
  return arr as number[][];
}


export async function greedyClustering(
  D: tf.Tensor2D
): Promise<number[][]> 
{
  // Initialize clusters array
  let clusters: number[][] = [];
  let clusterDict: Record<number, Set<number>> = {};
  let n = D.shape[0];
  for (let i = 0; i < n; i++) {
    let means = D.mean(1);
    let cluster = await means.argMax(0).array() as number;
    let col = await D.slice([cluster, 0], [1, n]).argMax().array() as number;
    // Create a tensor that will be used to zero out the selected column
    const mask = tf.oneHot(col, n).cast(D.dtype).sub(1).abs();

    // Use broadcasting to apply the mask
    D = D.mul(mask);

    // Dispose mask tensor
    mask.dispose();
  }
  return clusters;
}

