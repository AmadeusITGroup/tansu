window.BENCHMARK_DATA = {
  "lastUpdate": 1731083089300,
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
      }
    ]
  }
}