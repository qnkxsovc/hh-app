/* eslint-disable @typescript-eslint/no-use-before-define */
class UnionFind {
  count: number;
  parent: Map<ClueNode, ClueNode>;
  constructor(elements) {
    // Number of disconnected components
    this.count = elements.length;

    // Keep Track of connected components
    this.parent = new Map();

    // Initialize the data structure such that all
    // elements have themselves as parents
    elements.forEach((e) => this.parent.set(e, e));
  }

  union(a: ClueNode, b: ClueNode): void {
    const rootA: ClueNode = this.find(a);
    const rootB: ClueNode = this.find(b);
    //console.log(`rootA: ${rootA.id}, rootB: ${rootB.id}`)
    // Roots are same so these are already connected.
    if (rootA.id === rootB.id) return;

    // Always make the element with smaller root the parent.
    if (rootA.id < rootB.id) {
      if (this.parent.get(b) != b) {
        this.union(this.parent.get(b), a);
      } else {
        this.parent.set(b, this.parent.get(a));
      }
    } else {
      if (this.parent.get(a) != a) {
        this.union(this.parent.get(a), b);
      } else {
        this.parent.set(a, this.parent.get(b));
      }
    }
  }

  // Returns final parent of a node
  find(a: ClueNode): ClueNode {
    // console.log(`parent of ${a.id} is:`)
    while (this.parent.get(a) !== a) {
      a = this.parent.get(a);
    }
    //console.log(`${a.id}`)
    return a;
  }

  // Checks connectivity of the 2 nodes
  connected(a: ClueNode, b: ClueNode): boolean {
    return this.find(a) === this.find(b);
  }
}

class ClueNode {
  id: number;
  lat: number;
  long: number;
  constructor(id: number, lat: number, long: number) {
    this.id = id;
    this.lat = lat;
    this.long = long;
  }
}

class Edge {
  from: ClueNode;
  to: ClueNode;
  weight: number;
  constructor(from: ClueNode, to: ClueNode, weight: number) {
    this.from = to;
    this.to = from;
    this.weight = weight;
  }
}

class Graph {
  edges: Edge[];
  nodes: ClueNode[];
  constructor() {
    this.edges = [];
    this.nodes = [];
  }

  kruskalsMST(): Graph {
    // Initialize graph that'll contain the MST
    const MST = new Graph();
    this.nodes.forEach((node) => MST.addNode(node));
    if (this.nodes.length === 0) {
      return MST;
    }

    // duplicate all edges in this graph and sort by weight
    const edgeQueue: Edge[] = this.edges.slice();
    edgeQueue.sort((a, b) => a.weight - b.weight);
    //console.log(edgeQueue)
    const uf = new UnionFind(this.nodes);

    // Loop until either we explore all nodes or queue is empty
    while (edgeQueue.length > 0) {
      // Get the edge data using destructuring
      const nextEdge: Edge = edgeQueue.shift();
      const nodes = [nextEdge.to, nextEdge.from];

      // console.log(`edges remaining: ${edgeQueue.length}`)
      //console.log(`are ${nodes[0].id} and ${nodes[1].id} connected?: ${uf.connected(nodes[0], nodes[1])}`)
      if (!uf.connected(nodes[0], nodes[1])) {
        //console.log(`adding edge between ${nodes[0].id} and ${nodes[1].id}`)
        MST.addEdge(nodes[0], nodes[1]);
        uf.union(nodes[0], nodes[1]);
      }
    }
    return MST;
  }

  addNode(node: ClueNode): void {
    this.nodes.push(node);
  }
  addEdge(node1: ClueNode, node2: ClueNode): void {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    this.edges.push(new Edge(node1, node2, pythDistance(node1, node2)));
  }

  display(): void {
    let graph = "";
    this.nodes.forEach((node) => {
      graph +=
        node.id +
        "->" +
        this.edges
          .filter((edge) => edge.from.id === node.id)
          .map((obj) => obj.to.id)
          .join(", ") +
        "\n";
    });
    console.log(graph);
  }
}

const locs = [
  { id: 1, lat: 1, long: 2 },
  { id: 2, lat: 12, long: -3 },
  { id: 3, lat: 4, long: 54 },
  { id: 4, lat: 23, long: 86 },
  { id: 5, lat: 32, long: 43 },
];

/**
 * @returns - clue IDS in their order in the path
 * @param - locations a list of ClueNodes
 */
function orderPath(locations: ClueNode[]): number[] {
  return [];
}

// returns a list of edges in a MST of the given list of edges
function makeMST(locations: ClueNode[]): Edge[] {
  const connectedGraph = makeFullyConnectedGraph(locations);
  const MST = connectedGraph.kruskalsMST();

  return MST.edges;
}

function pythDistance(loc1: ClueNode, loc2: ClueNode): number {
  return Math.sqrt(
    Math.pow(loc1.lat + loc2.lat, 2) + Math.pow(loc1.long + loc2.long, 2)
  );
}

// returns a list of Edges
function makeFullyConnectedGraph(locations: ClueNode[]): Graph {
  const connectedGraph = new Graph();
  const edges = [];
  for (let i = 0; i < locations.length; i++) {
    for (let j = 0; j < locations.length; j++) {
      if (i !== j) {
        const node1 = locs[i];
        const node2 = locs[j];
        if (!connectedGraph.nodes.includes(node1))
          connectedGraph.addNode(node1);
        if (!connectedGraph.nodes.includes(node2))
          connectedGraph.addNode(node2);
        connectedGraph.addEdge(node1, node2);
      }
    }
  }
  return connectedGraph;
}

//console.log(makeFullyConnectedGraph(locs).display());
//console.log(makeFullyConnectedGraph(locs).kruskalsMST().display());
console.log(makeMST(locs));
