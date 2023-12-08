import * as grpc from '@grpc/grpc-js'
import * as protoLoader from '@grpc/proto-loader'
import * as k8s from '@kubernetes/client-node';

const packageDef = protoLoader.loadSync("./cluster.proto", {});  
const grpcObject = grpc.loadPackageDefinition(packageDef);
const clusterPackage : any = grpcObject.clusterPackage;

const server  = new grpc.Server();
const kc = new k8s.KubeConfig();

kc.loadFromDefault();

const k8sApi = kc.makeApiClient(k8s.CoreV1Api);


let nodes = [
  {id: 1, nodeName: 'Node1' },
  {id: 2, nodeName: 'Node1' },
]

server.addService(clusterPackage.Cluster.service, {
  "allNodes" : allNodes
});

async function allNodes(
  call: grpc.ServerUnaryCall<null, any>,
  callback: grpc.sendUnaryData<any>
) {
  const response = await k8sApi.listNode();
  const nodes = response.body.items.map((node,index)=>{
    return {id: index, nodeName: node.metadata?.name}
  })
  callback(null, {items: nodes})
}

server.bindAsync("127.0.0.1:50000", grpc.ServerCredentials.createInsecure(), (error, port) => {
  server.start();
  console.log(`GRPC SERVER ===> PORT: ${port}`)
})