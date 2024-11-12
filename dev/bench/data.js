window.BENCHMARK_DATA = {
  "lastUpdate": 1731415633772,
  "repoUrl": "https://github.com/AmadeusITGroup/tansu",
  "entries": {
    "Tansu benchmarks": [
      {
        "commit": {
          "author": {
            "email": "david-emmanuel.divernois@amadeus.com",
            "name": "David-Emmanuel DIVERNOIS",
            "username": "divdavem"
          },
          "committer": {
            "email": "david-emmanuel.divernois@amadeus.com",
            "name": "divdavem",
            "username": "divdavem"
          },
          "distinct": true,
          "id": "83920d940e88e7ecdcbdcbefa34067714401304d",
          "message": "Adding some benchmarks",
          "timestamp": "2024-11-08T17:23:33+01:00",
          "tree_id": "26b5700cc8563b7bda4c64543d5cb3ee1da91ab8",
          "url": "https://github.com/AmadeusITGroup/tansu/commit/83920d940e88e7ecdcbdcbefa34067714401304d"
        },
        "date": 1731083088744,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "benchmarks/basic.bench.ts > creating base stores > writable",
            "value": 951023.2715161833,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/basic.bench.ts > creating base stores > readable",
            "value": 2608445.0922798053,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/basic.bench.ts > creating base stores > new StoreClass",
            "value": 2060066.6032747915,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/basic.bench.ts > creating derived stores > computed",
            "value": 71223.30087207737,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/basic.bench.ts > creating derived stores > derived",
            "value": 73557.41639544607,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/basic.bench.ts > creating derived stores > new DoubleStoreClass",
            "value": 1142961.446806173,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/basic.bench.ts > updating derived stores > computed",
            "value": 457450.34768957354,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/basic.bench.ts > updating derived stores > derived",
            "value": 496190.81112685904,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/basic.bench.ts > updating derived stores > DoubleStoreClass",
            "value": 502431.0132250225,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/basic.bench.ts > updating writable stores > without subscriber",
            "value": 963943.209566206,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/basic.bench.ts > updating writable stores > with subscriber",
            "value": 897260.7079452954,
            "unit": "Hz"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "david-emmanuel.divernois@amadeus.com",
            "name": "David-Emmanuel DIVERNOIS",
            "username": "divdavem"
          },
          "committer": {
            "email": "david-emmanuel.divernois@amadeus.com",
            "name": "divdavem",
            "username": "divdavem"
          },
          "distinct": true,
          "id": "59ca0cc1ce3631a3aa4fe16958cbfd7377dd4b5a",
          "message": "Run garbage collection before each benchmark test",
          "timestamp": "2024-11-12T13:42:54+01:00",
          "tree_id": "d97c118676ebe1812a1e7a1116040b8905aebe5e",
          "url": "https://github.com/AmadeusITGroup/tansu/commit/59ca0cc1ce3631a3aa4fe16958cbfd7377dd4b5a"
        },
        "date": 1731415632664,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "benchmarks/basic.bench.ts > creating base stores > writable",
            "value": 1202275.0453935843,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/basic.bench.ts > creating base stores > readable",
            "value": 3092659.9134046673,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/basic.bench.ts > creating base stores > new StoreClass",
            "value": 2013542.7596578647,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/basic.bench.ts > creating derived stores > computed",
            "value": 72024.87151432529,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/basic.bench.ts > creating derived stores > derived",
            "value": 76982.05404765507,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/basic.bench.ts > creating derived stores > new DoubleStoreClass",
            "value": 1165156.047198109,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/basic.bench.ts > updating derived stores > computed",
            "value": 456191.588515096,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/basic.bench.ts > updating derived stores > derived",
            "value": 500107.07580253243,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/basic.bench.ts > updating derived stores > DoubleStoreClass",
            "value": 515033.74557384686,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/basic.bench.ts > updating writable stores > without subscriber",
            "value": 977902.1451774735,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/basic.bench.ts > updating writable stores > with subscriber",
            "value": 913875.3639443234,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/cellxBench.bench.ts > cellx1000",
            "value": 4.049702620678023,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/cellxBench.bench.ts > cellx2500",
            "value": 1.558700508231477,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/cellxBench.bench.ts > cellx5000",
            "value": 0.732755535555127,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/molBench.bench.ts > molBench",
            "value": 0.8748258235673139,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > onlyCreateDataSignals",
            "value": 94.29929468076348,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > createComputations0to1",
            "value": 4.983091118587214,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > createComputations1to1",
            "value": 3.6274075907650722,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > createComputations2to1",
            "value": 6.703170259480923,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > createComputations4to1",
            "value": 10.427430283819978,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > createComputations1000to1",
            "value": 27.375791546081114,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > createComputations1to2",
            "value": 4.019799994384986,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > createComputations1to4",
            "value": 4.007414508706214,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > createComputations1to8",
            "value": 4.032252827465174,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > createComputations1to1000",
            "value": 4.215024199170477,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > updateComputations1to1",
            "value": 7.80247430816869,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > updateComputations2to1",
            "value": 15.146201749197955,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > updateComputations4to1",
            "value": 28.51653586939752,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > updateComputations1000to1",
            "value": 58.823556401396374,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > updateComputations1to2",
            "value": 10.273933540681487,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > updateComputations1to4",
            "value": 12.004405415113318,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > updateComputations1to1000",
            "value": 6.126035652195659,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/kairo/avoidable.bench.ts > avoidablePropagation",
            "value": 55.187137612675414,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/kairo/broad.bench.ts > broad",
            "value": 59.72945721542656,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/kairo/deep.bench.ts > deep",
            "value": 160.1235502243261,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/kairo/diamond.bench.ts > diamond",
            "value": 75.14472394289409,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/kairo/mux.bench.ts > mux",
            "value": 111.8123250250671,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/kairo/repeated.bench.ts > repeated",
            "value": 645.4940707842377,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/kairo/triangle.bench.ts > triangle",
            "value": 250.22091527998788,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/kairo/unstable.bench.ts > unstable",
            "value": 734.8659842078085,
            "unit": "Hz"
          }
        ]
      }
    ]
  }
}