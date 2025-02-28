window.BENCHMARK_DATA = {
  "lastUpdate": 1740734278493,
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
      },
      {
        "commit": {
          "author": {
            "email": "david-emmanuel.divernois@amadeus.com",
            "name": "divdavem",
            "username": "divdavem"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "cf9f6b55a0a862e43be0f5a03c6acca71d1442a0",
          "message": "Rewriting tansu with a signal-first approach (#139)",
          "timestamp": "2024-12-04T11:43:37+01:00",
          "tree_id": "31b412190af9c31b7f26756a3ae9b153e3ffe0db",
          "url": "https://github.com/AmadeusITGroup/tansu/commit/cf9f6b55a0a862e43be0f5a03c6acca71d1442a0"
        },
        "date": 1733309340281,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "benchmarks/basic.bench.ts > creating base stores > writable",
            "value": 7439157.821460682,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/basic.bench.ts > creating base stores > readable",
            "value": 9271767.258251756,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/basic.bench.ts > creating base stores > new StoreClass",
            "value": 6272062.406906209,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/basic.bench.ts > creating derived stores > computed",
            "value": 5581450.280931595,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/basic.bench.ts > creating derived stores > derived",
            "value": 3617575.7323009763,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/basic.bench.ts > creating derived stores > new DoubleStoreClass",
            "value": 4097221.950828744,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/basic.bench.ts > updating derived stores > computed",
            "value": 1526399.0658459598,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/basic.bench.ts > updating derived stores > derived",
            "value": 1890695.640769963,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/basic.bench.ts > updating derived stores > DoubleStoreClass",
            "value": 1719444.4421849097,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/basic.bench.ts > updating writable stores > without subscriber",
            "value": 10474974.554426346,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/basic.bench.ts > updating writable stores > with subscriber",
            "value": 5850879.52021435,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/cellxBench.bench.ts > cellx1000",
            "value": 52.9198874224651,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/cellxBench.bench.ts > cellx2500",
            "value": 19.70220953541785,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/cellxBench.bench.ts > cellx5000",
            "value": 5.950615596003414,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/dynamic.bench.ts > dynamic simple component",
            "value": 0.42852158218189385,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/dynamic.bench.ts > dynamic dynamic component",
            "value": 0.8027865899744268,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/dynamic.bench.ts > dynamic large web app",
            "value": 0.3438927500997979,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/dynamic.bench.ts > dynamic wide dense",
            "value": 0.3237694388409725,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/dynamic.bench.ts > dynamic deep",
            "value": 0.9853366011402945,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/dynamic.bench.ts > dynamic very dynamic",
            "value": 0.7365527145544603,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/molBench.bench.ts > molBench",
            "value": 1.432502713710221,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > onlyCreateDataSignals",
            "value": 747.2870045015625,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > createComputations0to1",
            "value": 166.22802027491903,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > createComputations1to1",
            "value": 47.349555930414,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > createComputations2to1",
            "value": 165.86250761086572,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > createComputations4to1",
            "value": 194.6528268612702,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > createComputations1000to1",
            "value": 437.9267024560973,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > createComputations1to2",
            "value": 55.78716982719706,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > createComputations1to4",
            "value": 122.89622476276517,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > createComputations1to8",
            "value": 128.99679809307457,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > createComputations1to1000",
            "value": 130.4218785752382,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > updateComputations1to1",
            "value": 44.94415351844195,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > updateComputations2to1",
            "value": 83.23322589205398,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > updateComputations4to1",
            "value": 134.60920557318786,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > updateComputations1000to1",
            "value": 158.2901491754495,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > updateComputations1to2",
            "value": 45.74206643384855,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > updateComputations1to4",
            "value": 47.353044148450635,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > updateComputations1to1000",
            "value": 43.40620159949573,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/kairo/avoidable.bench.ts > avoidablePropagation",
            "value": 90.99646585947701,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/kairo/broad.bench.ts > broad",
            "value": 220.4708639143062,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/kairo/deep.bench.ts > deep",
            "value": 581.1620306043399,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/kairo/diamond.bench.ts > diamond",
            "value": 152.14900901704766,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/kairo/mux.bench.ts > mux",
            "value": 381.2870572591513,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/kairo/repeated.bench.ts > repeated",
            "value": 808.9868217959587,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/kairo/triangle.bench.ts > triangle",
            "value": 613.48610477553,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/kairo/unstable.bench.ts > unstable",
            "value": 1454.1730671171986,
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
          "id": "b5aebe9fae8924a12bc4e2c37074462102c8a797",
          "message": "Call makeGraph from setup in dynamic bench test",
          "timestamp": "2024-12-04T16:37:50+01:00",
          "tree_id": "7fc8819addda8938c01c7915e38426519404cd99",
          "url": "https://github.com/AmadeusITGroup/tansu/commit/b5aebe9fae8924a12bc4e2c37074462102c8a797"
        },
        "date": 1733327008026,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "benchmarks/basic.bench.ts > creating base stores > writable",
            "value": 7632720.397127779,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/basic.bench.ts > creating base stores > readable",
            "value": 9330059.906693693,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/basic.bench.ts > creating base stores > new StoreClass",
            "value": 6405231.346661161,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/basic.bench.ts > creating derived stores > computed",
            "value": 5739712.50768153,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/basic.bench.ts > creating derived stores > derived",
            "value": 3583362.6454852154,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/basic.bench.ts > creating derived stores > new DoubleStoreClass",
            "value": 3961038.368050876,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/basic.bench.ts > updating derived stores > computed",
            "value": 1546954.2519428087,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/basic.bench.ts > updating derived stores > derived",
            "value": 1836685.5114427514,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/basic.bench.ts > updating derived stores > DoubleStoreClass",
            "value": 1708712.2126855003,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/basic.bench.ts > updating writable stores > without subscriber",
            "value": 9822960.52658544,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/basic.bench.ts > updating writable stores > with subscriber",
            "value": 5926346.980661506,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/cellxBench.bench.ts > cellx1000",
            "value": 50.56516421493135,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/cellxBench.bench.ts > cellx2500",
            "value": 19.862865860407904,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/cellxBench.bench.ts > cellx5000",
            "value": 5.166320692377279,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/dynamic.bench.ts > dynamic simple component",
            "value": 0.42966812482419214,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/dynamic.bench.ts > dynamic dynamic component",
            "value": 0.7686536947828737,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/dynamic.bench.ts > dynamic large web app",
            "value": 0.35530036847193924,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/dynamic.bench.ts > dynamic wide dense",
            "value": 0.305064180462841,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/dynamic.bench.ts > dynamic deep",
            "value": 0.9867310045778268,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/dynamic.bench.ts > dynamic very dynamic",
            "value": 0.7045406369253995,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/molBench.bench.ts > molBench",
            "value": 1.4353374578169518,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > onlyCreateDataSignals",
            "value": 782.8883079973004,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > createComputations0to1",
            "value": 170.9443308913597,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > createComputations1to1",
            "value": 46.93556971101496,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > createComputations2to1",
            "value": 164.12030974161172,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > createComputations4to1",
            "value": 191.3271960019877,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > createComputations1000to1",
            "value": 453.9302082304889,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > createComputations1to2",
            "value": 59.22277361553759,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > createComputations1to4",
            "value": 116.99969264180935,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > createComputations1to8",
            "value": 129.03223449932457,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > createComputations1to1000",
            "value": 130.87178652284703,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > updateComputations1to1",
            "value": 48.47729086932639,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > updateComputations2to1",
            "value": 84.96151875472277,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > updateComputations4to1",
            "value": 136.69457690594547,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > updateComputations1000to1",
            "value": 150.44889833714794,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > updateComputations1to2",
            "value": 45.036713870403574,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > updateComputations1to4",
            "value": 45.31286332481796,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > updateComputations1to1000",
            "value": 43.59535368171294,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/kairo/avoidable.bench.ts > avoidablePropagation",
            "value": 90.3966505195454,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/kairo/broad.bench.ts > broad",
            "value": 218.5217562604681,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/kairo/deep.bench.ts > deep",
            "value": 595.1202789208089,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/kairo/diamond.bench.ts > diamond",
            "value": 155.28249332608283,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/kairo/mux.bench.ts > mux",
            "value": 404.6284511704898,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/kairo/repeated.bench.ts > repeated",
            "value": 790.8161719151266,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/kairo/triangle.bench.ts > triangle",
            "value": 617.4811219684739,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/kairo/unstable.bench.ts > unstable",
            "value": 1466.4031895747787,
            "unit": "Hz"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "1152706+divdavem@users.noreply.github.com",
            "name": "divdavem",
            "username": "divdavem"
          },
          "committer": {
            "email": "david-emmanuel.divernois@amadeus.com",
            "name": "divdavem",
            "username": "divdavem"
          },
          "distinct": true,
          "id": "d9c5622cb4982fe5a6cbd7126ad9a8c65bc3b871",
          "message": "chore: Update all dependencies",
          "timestamp": "2025-01-10T17:32:44+01:00",
          "tree_id": "54f986651424a5a61d5030c995c01714ebf33285",
          "url": "https://github.com/AmadeusITGroup/tansu/commit/d9c5622cb4982fe5a6cbd7126ad9a8c65bc3b871"
        },
        "date": 1736527092237,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "benchmarks/basic.bench.ts > creating base stores > writable",
            "value": 7391890.772946647,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/basic.bench.ts > creating base stores > readable",
            "value": 9059843.963761544,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/basic.bench.ts > creating base stores > new StoreClass",
            "value": 6263009.423802835,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/basic.bench.ts > creating derived stores > computed",
            "value": 5229305.1511796145,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/basic.bench.ts > creating derived stores > derived",
            "value": 3466097.16120264,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/basic.bench.ts > creating derived stores > new DoubleStoreClass",
            "value": 4027873.6536017666,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/basic.bench.ts > updating derived stores > computed",
            "value": 1584987.790784245,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/basic.bench.ts > updating derived stores > derived",
            "value": 1856986.662970427,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/basic.bench.ts > updating derived stores > DoubleStoreClass",
            "value": 1713882.2278446965,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/basic.bench.ts > updating writable stores > without subscriber",
            "value": 9798970.432049982,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/basic.bench.ts > updating writable stores > with subscriber",
            "value": 6274553.9498024555,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/cellxBench.bench.ts > cellx1000",
            "value": 51.442565785025195,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/cellxBench.bench.ts > cellx2500",
            "value": 20.240210263400314,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/cellxBench.bench.ts > cellx5000",
            "value": 6.002111068507128,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/dynamic.bench.ts > dynamic simple component",
            "value": 0.41494466701122484,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/dynamic.bench.ts > dynamic dynamic component",
            "value": 0.7628623251201945,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/dynamic.bench.ts > dynamic large web app",
            "value": 0.34746145162743075,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/dynamic.bench.ts > dynamic wide dense",
            "value": 0.3096809549411438,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/dynamic.bench.ts > dynamic deep",
            "value": 0.9877872829119295,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/dynamic.bench.ts > dynamic very dynamic",
            "value": 0.7108941401532408,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/molBench.bench.ts > molBench",
            "value": 1.4168840943437946,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > onlyCreateDataSignals",
            "value": 736.6786636816755,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > createComputations0to1",
            "value": 172.33657361351416,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > createComputations1to1",
            "value": 47.95923282964394,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > createComputations2to1",
            "value": 170.84644785928955,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > createComputations4to1",
            "value": 191.05435773307306,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > createComputations1000to1",
            "value": 457.6153554002474,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > createComputations1to2",
            "value": 58.72342393641218,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > createComputations1to4",
            "value": 123.80270825173507,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > createComputations1to8",
            "value": 132.32125819299713,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > createComputations1to1000",
            "value": 127.2480409358853,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > updateComputations1to1",
            "value": 46.16003843423266,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > updateComputations2to1",
            "value": 82.98497885736501,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > updateComputations4to1",
            "value": 137.75152682644588,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > updateComputations1000to1",
            "value": 160.05821028607937,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > updateComputations1to2",
            "value": 46.666588746426285,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > updateComputations1to4",
            "value": 46.87065183159988,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > updateComputations1to1000",
            "value": 43.10328866533036,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/kairo/avoidable.bench.ts > avoidablePropagation",
            "value": 89.82863104603734,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/kairo/broad.bench.ts > broad",
            "value": 226.97299079546474,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/kairo/deep.bench.ts > deep",
            "value": 588.163481878049,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/kairo/diamond.bench.ts > diamond",
            "value": 156.9776504004162,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/kairo/mux.bench.ts > mux",
            "value": 383.35768802728717,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/kairo/repeated.bench.ts > repeated",
            "value": 801.2286443644169,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/kairo/triangle.bench.ts > triangle",
            "value": 624.0994947150903,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/kairo/unstable.bench.ts > unstable",
            "value": 1452.847580958918,
            "unit": "Hz"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "david-emmanuel.divernois@amadeus.com",
            "name": "divdavem",
            "username": "divdavem"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "0d4e9a3109893cf0c0b255771cac9d796f094563",
          "message": "doc: fix mistake about diamond dependency problem in Svelte stores (#149)",
          "timestamp": "2025-01-22T10:07:16+01:00",
          "tree_id": "97440def8250d6ce6292e138f6a795c8c96acb49",
          "url": "https://github.com/AmadeusITGroup/tansu/commit/0d4e9a3109893cf0c0b255771cac9d796f094563"
        },
        "date": 1737538129230,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "benchmarks/basic.bench.ts > creating base stores > writable",
            "value": 7137476.543957878,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/basic.bench.ts > creating base stores > readable",
            "value": 8187909.116341502,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/basic.bench.ts > creating base stores > new StoreClass",
            "value": 6381761.7191923475,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/basic.bench.ts > creating derived stores > computed",
            "value": 5085514.50485897,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/basic.bench.ts > creating derived stores > derived",
            "value": 3377943.2028051093,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/basic.bench.ts > creating derived stores > new DoubleStoreClass",
            "value": 4121374.499835322,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/basic.bench.ts > updating derived stores > computed",
            "value": 1561340.2231952639,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/basic.bench.ts > updating derived stores > derived",
            "value": 1840387.2417600793,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/basic.bench.ts > updating derived stores > DoubleStoreClass",
            "value": 1648279.2945360553,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/basic.bench.ts > updating writable stores > without subscriber",
            "value": 9942592.707493907,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/basic.bench.ts > updating writable stores > with subscriber",
            "value": 4871292.538622022,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/cellxBench.bench.ts > cellx1000",
            "value": 51.15346066333398,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/cellxBench.bench.ts > cellx2500",
            "value": 19.110510755689724,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/cellxBench.bench.ts > cellx5000",
            "value": 4.771322844258225,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/dynamic.bench.ts > dynamic simple component",
            "value": 0.4121161621526651,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/dynamic.bench.ts > dynamic dynamic component",
            "value": 0.7341501477746206,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/dynamic.bench.ts > dynamic large web app",
            "value": 0.3401443734391499,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/dynamic.bench.ts > dynamic wide dense",
            "value": 0.29410744828618857,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/dynamic.bench.ts > dynamic deep",
            "value": 0.9658553841253311,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/dynamic.bench.ts > dynamic very dynamic",
            "value": 0.6978163652289233,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/molBench.bench.ts > molBench",
            "value": 1.318505821905176,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > onlyCreateDataSignals",
            "value": 766.6968453719228,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > createComputations0to1",
            "value": 173.56879124922162,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > createComputations1to1",
            "value": 46.28262908235369,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > createComputations2to1",
            "value": 162.3837133840638,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > createComputations4to1",
            "value": 186.51400006327668,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > createComputations1000to1",
            "value": 442.788276230197,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > createComputations1to2",
            "value": 56.975122942246365,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > createComputations1to4",
            "value": 116.85432560290782,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > createComputations1to8",
            "value": 123.99224106152307,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > createComputations1to1000",
            "value": 130.13509434561703,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > updateComputations1to1",
            "value": 45.019057428243464,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > updateComputations2to1",
            "value": 81.87077811117726,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > updateComputations4to1",
            "value": 142.02958129389376,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > updateComputations1000to1",
            "value": 157.35511875514405,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > updateComputations1to2",
            "value": 47.12448577147517,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > updateComputations1to4",
            "value": 46.35919751788702,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > updateComputations1to1000",
            "value": 45.16526682976944,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/kairo/avoidable.bench.ts > avoidablePropagation",
            "value": 87.32716913736697,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/kairo/broad.bench.ts > broad",
            "value": 225.42861690530427,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/kairo/deep.bench.ts > deep",
            "value": 601.5729361537487,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/kairo/diamond.bench.ts > diamond",
            "value": 153.0957981508172,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/kairo/mux.bench.ts > mux",
            "value": 391.62182646705395,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/kairo/repeated.bench.ts > repeated",
            "value": 797.99040161983,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/kairo/triangle.bench.ts > triangle",
            "value": 616.1580386744447,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/kairo/unstable.bench.ts > unstable",
            "value": 1472.6887444503384,
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
          "id": "37ec893991d71189594efa3a1388eec50b1da7b2",
          "message": "fix: usage of vi.useFakeTimers in test after updating to vitest 3",
          "timestamp": "2025-02-03T17:55:38+01:00",
          "tree_id": "9637a72ffd25874cd54aef979107316bc8be9439",
          "url": "https://github.com/AmadeusITGroup/tansu/commit/37ec893991d71189594efa3a1388eec50b1da7b2"
        },
        "date": 1738602082462,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "benchmarks/basic.bench.ts > creating base stores > writable",
            "value": 7371934.348681919,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/basic.bench.ts > creating base stores > readable",
            "value": 8843000.851905864,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/basic.bench.ts > creating base stores > new StoreClass",
            "value": 6148442.007900838,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/basic.bench.ts > creating derived stores > computed",
            "value": 5308556.640998805,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/basic.bench.ts > creating derived stores > derived",
            "value": 3424373.4726411123,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/basic.bench.ts > creating derived stores > new DoubleStoreClass",
            "value": 3981833.1319603156,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/basic.bench.ts > updating derived stores > computed",
            "value": 1499574.9862858641,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/basic.bench.ts > updating derived stores > derived",
            "value": 1882083.9849389067,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/basic.bench.ts > updating derived stores > DoubleStoreClass",
            "value": 1562911.1747801981,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/basic.bench.ts > updating writable stores > without subscriber",
            "value": 8973225.461588793,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/basic.bench.ts > updating writable stores > with subscriber",
            "value": 5749591.320704598,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/cellxBench.bench.ts > cellx1000",
            "value": 46.81784017208674,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/cellxBench.bench.ts > cellx2500",
            "value": 17.077009851778215,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/cellxBench.bench.ts > cellx5000",
            "value": 5.0015457752365196,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/dynamic.bench.ts > dynamic simple component",
            "value": 0.4055431920369304,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/dynamic.bench.ts > dynamic dynamic component",
            "value": 0.7516075377507767,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/dynamic.bench.ts > dynamic large web app",
            "value": 0.3480100833979772,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/dynamic.bench.ts > dynamic wide dense",
            "value": 0.30503505801582387,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/dynamic.bench.ts > dynamic deep",
            "value": 0.9205456595889637,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/dynamic.bench.ts > dynamic very dynamic",
            "value": 0.6875112460683332,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/molBench.bench.ts > molBench",
            "value": 1.414836611917614,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > onlyCreateDataSignals",
            "value": 730.9290179513144,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > createComputations0to1",
            "value": 166.43471380499878,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > createComputations1to1",
            "value": 43.311474629261284,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > createComputations2to1",
            "value": 155.17107981573005,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > createComputations4to1",
            "value": 177.37850014691557,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > createComputations1000to1",
            "value": 417.7284752617705,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > createComputations1to2",
            "value": 57.49099018052701,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > createComputations1to4",
            "value": 111.59309630744478,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > createComputations1to8",
            "value": 119.32501632798724,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > createComputations1to1000",
            "value": 126.49752963962484,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > updateComputations1to1",
            "value": 45.36064041256557,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > updateComputations2to1",
            "value": 78.78166301016002,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > updateComputations4to1",
            "value": 133.18596286663472,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > updateComputations1000to1",
            "value": 156.61097932451264,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > updateComputations1to2",
            "value": 45.442283043060726,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > updateComputations1to4",
            "value": 45.69762003635702,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > updateComputations1to1000",
            "value": 41.76665637350594,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/kairo/avoidable.bench.ts > avoidablePropagation",
            "value": 89.32684238443612,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/kairo/broad.bench.ts > broad",
            "value": 221.26468082187006,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/kairo/deep.bench.ts > deep",
            "value": 585.2395128559772,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/kairo/diamond.bench.ts > diamond",
            "value": 150.88338090077497,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/kairo/mux.bench.ts > mux",
            "value": 383.9444010112905,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/kairo/repeated.bench.ts > repeated",
            "value": 770.2821214344698,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/kairo/triangle.bench.ts > triangle",
            "value": 596.7419879260242,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/kairo/unstable.bench.ts > unstable",
            "value": 1452.2577728221943,
            "unit": "Hz"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "david-emmanuel.divernois@amadeus.com",
            "name": "divdavem",
            "username": "divdavem"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "56cdb73320b6700ac9c2d233a1d7399d5e3aac72",
          "message": "chore: remove api-extractor (#152)",
          "timestamp": "2025-02-28T10:11:50+01:00",
          "tree_id": "7d9c4a5c1ad935c0b5b27d612416731e62cfc335",
          "url": "https://github.com/AmadeusITGroup/tansu/commit/56cdb73320b6700ac9c2d233a1d7399d5e3aac72"
        },
        "date": 1740734277347,
        "tool": "customBiggerIsBetter",
        "benches": [
          {
            "name": "benchmarks/basic.bench.ts > creating base stores > writable",
            "value": 7448807.344506085,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/basic.bench.ts > creating base stores > readable",
            "value": 8717554.587753197,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/basic.bench.ts > creating base stores > new StoreClass",
            "value": 6313473.823225417,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/basic.bench.ts > creating derived stores > computed",
            "value": 5273336.639467482,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/basic.bench.ts > creating derived stores > derived",
            "value": 2949895.2094222787,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/basic.bench.ts > creating derived stores > new DoubleStoreClass",
            "value": 4078272.923329486,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/basic.bench.ts > updating derived stores > computed",
            "value": 1579650.4835358385,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/basic.bench.ts > updating derived stores > derived",
            "value": 1751286.430846298,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/basic.bench.ts > updating derived stores > DoubleStoreClass",
            "value": 1679781.304608514,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/basic.bench.ts > updating writable stores > without subscriber",
            "value": 9971891.641033618,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/basic.bench.ts > updating writable stores > with subscriber",
            "value": 5964390.807129853,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/cellxBench.bench.ts > cellx1000",
            "value": 50.77705999998452,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/cellxBench.bench.ts > cellx2500",
            "value": 17.157316535094235,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/cellxBench.bench.ts > cellx5000",
            "value": 5.204622196451339,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/dynamic.bench.ts > dynamic simple component",
            "value": 0.4194673336688664,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/dynamic.bench.ts > dynamic dynamic component",
            "value": 0.7690059978282132,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/dynamic.bench.ts > dynamic large web app",
            "value": 0.35246435861425457,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/dynamic.bench.ts > dynamic wide dense",
            "value": 0.3157419237448349,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/dynamic.bench.ts > dynamic deep",
            "value": 0.9787683228324718,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/dynamic.bench.ts > dynamic very dynamic",
            "value": 0.7051885607253773,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/molBench.bench.ts > molBench",
            "value": 1.4256096552687103,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > onlyCreateDataSignals",
            "value": 741.1786539804486,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > createComputations0to1",
            "value": 170.81987246254633,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > createComputations1to1",
            "value": 44.9558999431156,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > createComputations2to1",
            "value": 162.59495165954004,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > createComputations4to1",
            "value": 184.368788295851,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > createComputations1000to1",
            "value": 425.81881409459294,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > createComputations1to2",
            "value": 56.050992966823564,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > createComputations1to4",
            "value": 115.65028049081313,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > createComputations1to8",
            "value": 118.06209245137802,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > createComputations1to1000",
            "value": 126.6586534486324,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > updateComputations1to1",
            "value": 44.009191836344606,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > updateComputations2to1",
            "value": 83.2682570426641,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > updateComputations4to1",
            "value": 135.80395124312116,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > updateComputations1000to1",
            "value": 154.7892183022588,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > updateComputations1to2",
            "value": 43.86491160044987,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > updateComputations1to4",
            "value": 45.622145347982084,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/sBench.bench.ts > updateComputations1to1000",
            "value": 43.63149485194218,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/kairo/avoidable.bench.ts > avoidablePropagation",
            "value": 87.92985413472364,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/kairo/broad.bench.ts > broad",
            "value": 213.82832707229642,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/kairo/deep.bench.ts > deep",
            "value": 578.6898069262141,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/kairo/diamond.bench.ts > diamond",
            "value": 156.40552233846532,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/kairo/mux.bench.ts > mux",
            "value": 395.6410364701743,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/kairo/repeated.bench.ts > repeated",
            "value": 811.1150896594822,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/kairo/triangle.bench.ts > triangle",
            "value": 602.7027197632817,
            "unit": "Hz"
          },
          {
            "name": "benchmarks/js-reactivity-benchmarks/kairo/unstable.bench.ts > unstable",
            "value": 1427.8095359191561,
            "unit": "Hz"
          }
        ]
      }
    ]
  }
}