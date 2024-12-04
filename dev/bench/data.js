window.BENCHMARK_DATA = {
  "lastUpdate": 1733327009011,
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
      }
    ]
  }
}