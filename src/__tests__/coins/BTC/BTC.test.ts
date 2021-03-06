import {BTC, NetWorkType} from '../../../BTC';
import keyProvider from '../../../BTC/keyProvider';

const privateKey =
  '06a523eede06e72a472056be31429bb4016fe85f10389be898dbe283233131d0';
const publicKey =
  '03fbe02e16d35d3c9c6772c75ba5d0d1387573724082266ea667c53b9d00decd72';

const kp1 = keyProvider(privateKey, publicKey);

const privateKeyOne =
  'dc1429816a0f616f3c815bda70bea0fdef9039a71e1a3b08272f9452a59027c4';

const publicKeyOne =
  '02f325a85902d264dbcb0cbe144e9b2463f8252bd0c51bc19666f4c82461e4baa2';

const kp2 = keyProvider(privateKeyOne, publicKeyOne);

const utxoOne = {
  hash: 'd07ce19af4ff4088884dcee2cedba39c364e34f7cfd0b35bb2e07c8c15b07355',
  index: 1,
  sequence: 0xffffffff,
  utxo: {
    publicKey,
    script: 'a914915892366a6cdf24afa6e1c480db2ad88c63378087',
    value: 3578100,
  },
  bip32Derivation: [
    {
      pubkey: Buffer.from(publicKey, 'hex'),
      masterFingerprint: Buffer.from('01010101', 'hex'),
      path: `m/49'/0'/0'/0/0`,
    },
  ],
};

const utxoTwo = {
  hash: '89e5f831aa67e0f0dad44f9e7a5f06322a7270da02b837e3666a486323dc14e0',
  index: 0,
  utxo: {
    publicKey: publicKeyOne,
    script: 'a914745c56190d1fe8274e7ebe9dd4fe10ca3484959587',
    value: 2524291,
  },
  bip32Derivation: [
    {
      pubkey: Buffer.from(publicKeyOne, 'hex'),
      masterFingerprint: Buffer.from('01010101', 'hex'),
      path: `m/49'/0'/0'/0/0`,
    },
  ],
};

const multiSignUtxo = [
  {
    hash: 'ef0323f679a2406165ab490d24b8fa5773b7721e7cd6e421098f00a9afdc7ee0',
    index: 0,
    utxo: {
      publicKeys: [publicKey, publicKeyOne],
      value: 11110,
    },
  },
];

const omniMultiSignUtxo = [
  {
    hash: '6b57bb3631466c29739d576b86ba142b7f59aab1d2224c013ac914b109623e7d',
    index: 1,
    utxo: {
      publicKeys: [publicKey, publicKeyOne],
      value: 19999,
    },
  },
];

describe('coin.BTC', () => {
  const btc = new BTC(NetWorkType.mainNet);
  const xtn = new BTC(NetWorkType.testNet);

  it('should generate correct address', () => {
    expect(btc.generateAddress(publicKey)).toBe(
      '3EwY1PaQ5fB4M4nvWRYgUn2LNmokeJ36Pj',
    );

    expect(xtn.generateAddress(publicKey)).toBe(
      '2N6Vk58WRh7gQYrRUBZAZ6j1bb81vR8G7F4',
    );
    expect(xtn.generateAddress(publicKeyOne)).toBe(
      '2N3rUzBBAMqkiSra2o6DCb6LZPReQVU3LVe',
    );

    expect(xtn.generateMultiSignAddress([publicKey, publicKeyOne], 2)).toBe(
      '2N8rqpUpbyJMtSXK6obH5GVufZ5rwE9fi5V',
    );
  });

  it('should valid a address', () => {
    const result = btc.isAddressValid('3EwY1PaQ5fB4M4nvWRYgUn2LNmokeJ36Pj');
    expect(result).toBe(true);
    const failResult = btc.isAddressValid('3EwY1PaQ5fB4M4nvWRYgUn2LNmokeJ36Pu');
    expect(failResult).toBe(false);
    const failedResult = btc.isAddressValid('0xtastere2uieuriur');
    expect(failedResult).toBe(false);
    const validP2wpkhAddr = 'bc1qcsfgcpf0nhcqg7psw2729a6cld7z4fsq4w7qtz';
    expect(btc.isAddressValid(validP2wpkhAddr)).toBe(true);
    const validP2wshAddr =
      'bc1qwqdg6squsna38e46795at95yu9atm8azzmyvckulcc7kytlcckxswvvzej';
    expect(btc.isAddressValid(validP2wshAddr)).toBe(true);
    const invalidP2wshAddr =
      'bc1qwqdg6squsna38e46795at95yu9atm8azzmyvckulcc7kytlcckxswvvze';
    expect(btc.isAddressValid(invalidP2wshAddr)).toBe(false);
  });

  it('should generate the transaction', async () => {
    const txData = {
      inputs: [utxoOne, utxoTwo],
      outputs: {
        to: '2N6Vk58WRh7gQYrRUBZAZ6j1bb81vR8G7F4',
        amount: 102391,
        fee: 1000,
        changeAddress: '2N6Vk58WRh7gQYrRUBZAZ6j1bb81vR8G7F4',
      },
      version: 2,
      locktime: 0,
    };

    const result = await xtn.generateTransaction(txData, [kp1, kp2]);
    expect(result.txId).toEqual(
      '34bd17dea44660edf68e21c4024b52bc738aec0a9c052f67fa57d4ab26c334b0',
    );
    expect(result.txHex).toEqual(
      '020000000001025573b0158c7ce0b25bb3d0cff7344e369ca3dbcee2ce4d888840fff49ae17cd00100000017160014e9cf9131d9c02a3a02d246bb4297b5606c6cb2f9ffffffffe014dc2363486a66e337b802da70722a32065f7a9e4fd4daf0e067aa31f8e58900000000171600143007abdafe8f875c3d3b714428e7761494a71f6cffffffff02f78f01000000000017a914915892366a6cdf24afa6e1c480db2ad88c6337808798895b000000000017a914915892366a6cdf24afa6e1c480db2ad88c633780870247304402206b891a2c6b2a95bb7b7e25275544f3dd761269392dde98ab65c8f8187194ce0502203061881a7d0e92fd19ac68b77a1fee35d7b6b7b72e8fce369a35088c1b35cca7012103fbe02e16d35d3c9c6772c75ba5d0d1387573724082266ea667c53b9d00decd72024730440220236f1c70df027dd7c0c862c9b89b28cb3fca6a96d4c73f7f565b7cc4b0fdff6902202262c87aec91d1ad9e661d807d5f9a8aaacd8a634028a74013cc2141c8750d13012102f325a85902d264dbcb0cbe144e9b2463f8252bd0c51bc19666f4c82461e4baa200000000',
    );
  });

  it('should generate the transaction with locktime and version 1', async () => {
    const txData = {
      inputs: [utxoOne, utxoTwo],
      outputs: {
        to: '2N6Vk58WRh7gQYrRUBZAZ6j1bb81vR8G7F4',
        amount: 102391,
        fee: 1000,
        changeAddress: '2N6Vk58WRh7gQYrRUBZAZ6j1bb81vR8G7F4',
      },
      version: 1,
      locktime: 628083,
    };

    const result = await xtn.generateTransaction(txData, [kp1, kp2]);
    expect(result.txId).toEqual(
      '17eca42ddd5cb440636c333c79b6fee67dfe1368da3790b2022d5f61bd58fc62',
    );
    expect(result.txHex).toEqual(
      '010000000001025573b0158c7ce0b25bb3d0cff7344e369ca3dbcee2ce4d888840fff49ae17cd00100000017160014e9cf9131d9c02a3a02d246bb4297b5606c6cb2f9ffffffffe014dc2363486a66e337b802da70722a32065f7a9e4fd4daf0e067aa31f8e58900000000171600143007abdafe8f875c3d3b714428e7761494a71f6cffffffff02f78f01000000000017a914915892366a6cdf24afa6e1c480db2ad88c6337808798895b000000000017a914915892366a6cdf24afa6e1c480db2ad88c6337808702483045022100f5b55b77cc6379a73767e31f759b4f1dbb3ae9a544cfd5c78bf7a4ef4be339880220210ed1a9a60d75ce1fe9224618ffc9af331256d674dc497a8df1d3630b91f431012103fbe02e16d35d3c9c6772c75ba5d0d1387573724082266ea667c53b9d00decd72024730440220335114f2b9b3805eef2607c3b699d788187eab54c0279edb3d28a59c507ba1d2022007d32006272932820aaeb5d140469edeb62ba325fae5ad97ee9da376bf1c20e9012102f325a85902d264dbcb0cbe144e9b2463f8252bd0c51bc19666f4c82461e4baa273950900',
    );
  });

  it('should generate the transaction even if it have duplicated key provider', async () => {
    const txData = {
      inputs: [utxoOne, utxoTwo],
      outputs: {
        to: '2N6Vk58WRh7gQYrRUBZAZ6j1bb81vR8G7F4',
        amount: 102391,
        fee: 1000,
        changeAddress: '2N6Vk58WRh7gQYrRUBZAZ6j1bb81vR8G7F4',
      },
    };

    const result = await xtn.generateTransaction(txData, [kp1, kp2, kp1, kp2]);
    expect(result.txId).toEqual(
      '34bd17dea44660edf68e21c4024b52bc738aec0a9c052f67fa57d4ab26c334b0',
    );
    expect(result.txHex).toEqual(
      '020000000001025573b0158c7ce0b25bb3d0cff7344e369ca3dbcee2ce4d888840fff49ae17cd00100000017160014e9cf9131d9c02a3a02d246bb4297b5606c6cb2f9ffffffffe014dc2363486a66e337b802da70722a32065f7a9e4fd4daf0e067aa31f8e58900000000171600143007abdafe8f875c3d3b714428e7761494a71f6cffffffff02f78f01000000000017a914915892366a6cdf24afa6e1c480db2ad88c6337808798895b000000000017a914915892366a6cdf24afa6e1c480db2ad88c633780870247304402206b891a2c6b2a95bb7b7e25275544f3dd761269392dde98ab65c8f8187194ce0502203061881a7d0e92fd19ac68b77a1fee35d7b6b7b72e8fce369a35088c1b35cca7012103fbe02e16d35d3c9c6772c75ba5d0d1387573724082266ea667c53b9d00decd72024730440220236f1c70df027dd7c0c862c9b89b28cb3fca6a96d4c73f7f565b7cc4b0fdff6902202262c87aec91d1ad9e661d807d5f9a8aaacd8a634028a74013cc2141c8750d13012102f325a85902d264dbcb0cbe144e9b2463f8252bd0c51bc19666f4c82461e4baa200000000',
    );
  });

  it('should generate psbt base64 string', () => {
    const txData = {
      inputs: [utxoOne, utxoTwo],
      outputs: {
        to: '2N6Vk58WRh7gQYrRUBZAZ6j1bb81vR8G7F4',
        amount: 102391,
        fee: 1000,
        changeAddress: '2N6Vk58WRh7gQYrRUBZAZ6j1bb81vR8G7F4',
      },
    };

    const result = xtn.generatePsbt(txData);
    expect(result).toEqual(
      'cHNidP8BAJwCAAAAAlVzsBWMfOCyW7PQz/c0Tjaco9vO4s5NiIhA//Sa4XzQAQAAAAD/////4BTcI2NIambjN7gC2nByKjIGX3qeT9Ta8OBnqjH45YkAAAAAAP////8C948BAAAAAAAXqRSRWJI2amzfJK+m4cSA2yrYjGM3gIeYiVsAAAAAABepFJFYkjZqbN8kr6bhxIDbKtiMYzeAhwAAAAAAAQEg9Jg2AAAAAAAXqRSRWJI2amzfJK+m4cSA2yrYjGM3gIcBBBYAFOnPkTHZwCo6AtJGu0KXtWBsbLL5IgYD++AuFtNdPJxncsdbpdDROHVzckCCJm6mZ8U7nQDezXIYAQEBATEAAIAAAACAAAAAgAAAAAAAAAAAAAEBIIOEJgAAAAAAF6kUdFxWGQ0f6CdOfr6d1P4QyjSElZWHAQQWABQwB6va/o+HXD07cUQo53YUlKcfbCIGAvMlqFkC0mTbywy+FE6bJGP4JSvQxRvBlmb0yCRh5LqiGAEBAQExAACAAAAAgAAAAIAAAAAAAAAAAAAAAA==',
    );
  });

  it('should parse pbst string', () => {
    const txData = {
      inputs: [utxoOne, utxoTwo],
      outputs: {
        to: '2N6Vk58WRh7gQYrRUBZAZ6j1bb81vR8G7F4',
        amount: 102391,
        fee: 1000,
        changeAddress: '2N6Vk58WRh7gQYrRUBZAZ6j1bb81vR8G7F4',
      },
    };

    const result = xtn.generatePsbt(txData);
    const tx = xtn.parsePsbt(result);
    expect(tx.inputs.length).toBe(2);
    expect(tx.inputs[0].txId).toEqual(
      'd07ce19af4ff4088884dcee2cedba39c364e34f7cfd0b35bb2e07c8c15b07355',
    );
    expect(tx.inputs[1].txId).toEqual(
      '89e5f831aa67e0f0dad44f9e7a5f06322a7270da02b837e3666a486323dc14e0',
    );
    expect(tx.outputs[0].address).toEqual(
      '2N6Vk58WRh7gQYrRUBZAZ6j1bb81vR8G7F4',
    );
    expect(tx.outputs[1].address).toEqual(
      '2N6Vk58WRh7gQYrRUBZAZ6j1bb81vR8G7F4',
    );
    expect(tx.outputs[0].value).toEqual(102391);
    expect(tx.outputs[1].value).toEqual(5999000);
  });

  // https://btc.com/a7263645784c46f36a8200c06d349df82206f8b2b5f16f0ddd9adaf0b1a0f675
  it('should generate omni tx', async () => {
    const privateKey =
      '0437d0a4ae601819365884a858da3f61074e7bedff30b7d716c406e1937092e1';
    const publicKey =
      '02a18c6e271a995b162348b4332b63f13bf031617192d6232e809210ad5d85c382';

    const keyPair = keyProvider(privateKey, publicKey);

    const utxo = {
      hash: '344b4dda373534908be8c14946cf7d27c5161d3f759ef692f0c30c7d6ee604aa',
      index: 0,
      utxo: {
        publicKey,
        value: 3000,
      },
      bip32Derivation: [
        {
          pubkey: Buffer.from(publicKey, 'hex'),
          masterFingerprint: Buffer.from('01010101', 'hex'),
          path: `m/49'/0'/0'/0/0`,
        },
      ],
    };

    const txData = {
      inputs: [utxo],
      to: '38c8FFS9W4QEW55WXgo2wX8HZJCutH89VT',
      fee: 2454,
      changeAddress: '3CAgK3r8nDiMcdnqBUL3Yy7JMFDjvkXqHn',
      omniAmount: 1000,
    };

    const tx = await btc.generateOmniTransaction(txData, [keyPair]);
    expect(tx.txId).toBe(
      '39a775c80554e9fc9d39e8a64c977f31c1dd27140f9ceb9af7c106bd0eb04395',
    );
    expect(tx.txHex).toBe(
      '02000000000101aa04e66e7d0cc3f092f69e753f1d16c5277dcf4649c1e88b90343537da4d4b3400000000171600141ea4ea0a12d7c2b07e9084d36abd03a2edd72798ffffffff020000000000000000166a146f6d6e69000000000000001f00000000000003e8220200000000000017a9144bdc14152999fc8ad8c6df4c20946ba1e572c95e8702483045022100ac2e50d8041d4af85316b052af300ebdd459f6aa51af59e26663ebb07816f7dd02203a398c50bb582c2609ef7a6b0fcea004ee965d68e820d6b16ea8824f60bdbed9012102a18c6e271a995b162348b4332b63f13bf031617192d6232e809210ad5d85c38200000000',
    );
  });

  it('should generate the multiSign transaction', async () => {
    const txData = {
      inputs: multiSignUtxo,
      outputs: {
        to: '2N6Vk58WRh7gQYrRUBZAZ6j1bb81vR8G7F4',
        amount: 10110,
        fee: 1000,
        changeAddress: '2N8rqpUpbyJMtSXK6obH5GVufZ5rwE9fi5V',
      },
      version: 2,
      locktime: 0,
      requires: 2,
    };
    const {txId, txHex} = await xtn.generateMultiSignTransaction(txData, [
      kp1,
      kp2,
    ]);

    expect(txId).toBe(
      '8506019f98a692258bc604f53029ccc0e5ab90b2af2bb244aadc00f51160eb86',
    );
    expect(txHex).toBe(
      '02000000000101e07edcafa9008f0921e4d67c1e72b77357fab8240d49ab656140a279f62303ef00000000232200207690f26b840a14f928d7182e348ef3b2faa484e4b34d49ecec1b3013faadb75affffffff017e2700000000000017a914915892366a6cdf24afa6e1c480db2ad88c633780870400483045022100d53c71ff3e2a6014f0389a53cdda8cb5f378e0a9b1ed9f85fc31a80197ea5fe502200c27b2539f6b040feda85760b9c790730def70073e210e837c90620913768d4601473044022007297cc9f35c171b8a044492fb49f5a5c762de0fbfff3ea42896c99ec854cb500220361e9e497f811102547202eafc4340ff9c11403ee43ec10bd5563315b027dce00147522103fbe02e16d35d3c9c6772c75ba5d0d1387573724082266ea667c53b9d00decd722102f325a85902d264dbcb0cbe144e9b2463f8252bd0c51bc19666f4c82461e4baa252ae00000000',
    );
  });

  it('should generate the omni multiSign transaction', async () => {
    const txData = {
      inputs: omniMultiSignUtxo,
      to: '2N6Vk58WRh7gQYrRUBZAZ6j1bb81vR8G7F4',
      omniAmount: 10110,
      fee: 1000,
      changeAddress: '2N8rqpUpbyJMtSXK6obH5GVufZ5rwE9fi5V',
      requires: 2,
    };
    const {txId, txHex} = await xtn.generateOmniMultiSignTransaction(txData, [
      kp1,
      kp2,
    ]);

    expect(txId).toBe(
      '8a1b3bdc52571718bf7bd6952e5465bf4e884a699ec12d62ea4b34c76b1e7618',
    );
    expect(txHex).toBe(
      '020000000001017d3e6209b114c93a014c22d2b1aa597f2b14ba866b579d73296c463136bb576b01000000232200207690f26b840a14f928d7182e348ef3b2faa484e4b34d49ecec1b3013faadb75affffffff03154800000000000017a914ab465b094d7aaad13cbdbdfebb32115690b36ad6870000000000000000166a146f6d6e690000000000000001000000000000277e220200000000000017a914915892366a6cdf24afa6e1c480db2ad88c633780870400483045022100b7ef55a2eb79cefcc7181d29c6fcb189f003bac2bd9556bdfaa5f699d1a8ff2102203e7db828635e8b308bcebe29b76086e4aec85828c449106b4155f829cf26cf9201483045022100f394f3c1c01903a3bf86c16532d6347b105e32863c941974c12f267848d407a102202771098a734f2d6005303914c317656793f9e91d84fa09042d8eeec6a4759efa0147522103fbe02e16d35d3c9c6772c75ba5d0d1387573724082266ea667c53b9d00decd722102f325a85902d264dbcb0cbe144e9b2463f8252bd0c51bc19666f4c82461e4baa252ae00000000',
    );
  });

  it('should generate the omni multiSign transaction signatures', async () => {
    const txData = {
      inputs: omniMultiSignUtxo,
      to: '2N6Vk58WRh7gQYrRUBZAZ6j1bb81vR8G7F4',
      omniAmount: 10110,
      fee: 1000,
      changeAddress: '2N8rqpUpbyJMtSXK6obH5GVufZ5rwE9fi5V',
      requires: 2,
    };
    const signatures = await xtn.getOmniMultiSignTransactionSignature(txData, [
      kp1,
    ]);

    expect(signatures).toStrictEqual([
      '3045022100b7ef55a2eb79cefcc7181d29c6fcb189f003bac2bd9556bdfaa5f699d1a8ff2102203e7db828635e8b308bcebe29b76086e4aec85828c449106b4155f829cf26cf9201',
    ]);
  });

  it('should generate the multiSign transaction signatures', async () => {
    const txData = {
      inputs: multiSignUtxo,
      outputs: {
        to: '2N6Vk58WRh7gQYrRUBZAZ6j1bb81vR8G7F4',
        amount: 10110,
        fee: 1000,
        changeAddress: '2N8rqpUpbyJMtSXK6obH5GVufZ5rwE9fi5V',
      },
      version: 2,
      locktime: 0,
      requires: 2,
    };
    const signatures = await xtn.getMultiSignTransactionSignature(txData, [
      kp1,
    ]);

    expect(signatures).toStrictEqual([
      '3045022100d53c71ff3e2a6014f0389a53cdda8cb5f378e0a9b1ed9f85fc31a80197ea5fe502200c27b2539f6b040feda85760b9c790730def70073e210e837c90620913768d4601',
    ]);
  });

  it('should sign a given psbt', async () => {
    // txid: 8ff229d4c946c29750502d1cc105ca69a2a284bfbd2e560bd656cf18e3b78163
    const psbtStr =
      'cHNidP8BAHEBAAAAAfPQ5Rpeu5nH0TImK4Sbu9lxIOGEynRadywPxaPyhnTwAAAAAAD/////AkoRAAAAAAAAFgAUFCYoQzGSRmYVAuZNuXF0OrPg9jWIEwAAAAAAABYAFOZMlwM1sZGLivwOcOh77amAlvD5AAAAAAABAR+tKAAAAAAAABYAFM4u9V5WG+Fe9l3MefmYEX4ULWAWIgYDA+jO+oOuN37ABK67BA/+SuuR/57c7OkyfyR7hR34FDsYccBxUlQAAIAAAACAAAAAgAAAAAAFAAAAACICApJMZBvzWiavLN7nievKQoylwPoffLkXZUIgGHF4HgwaGHHAcVJUAACAAAAAgAAAAIABAAAACwAAAAAA';
    const pubkey =
      '0303e8cefa83ae377ec004aebb040ffe4aeb91ff9edcece9327f247b851df8143b';
    const prikey =
      '84f85bacd370966ba523222e6ea8c3bc2731b629e54c0362dd639d04f6fc3cbc';
    const keyProviders = [keyProvider(prikey, pubkey)];
    const result = await btc.signPSBTBase64(psbtStr, keyProviders);
    expect(result.psbtB64).toBe(
      'cHNidP8BAHEBAAAAAfPQ5Rpeu5nH0TImK4Sbu9lxIOGEynRadywPxaPyhnTwAAAAAAD/////AkoRAAAAAAAAFgAUFCYoQzGSRmYVAuZNuXF0OrPg9jWIEwAAAAAAABYAFOZMlwM1sZGLivwOcOh77amAlvD5AAAAAAABAR+tKAAAAAAAABYAFM4u9V5WG+Fe9l3MefmYEX4ULWAWAQhsAkgwRQIhANSbkZmrxoUne1RIwEpJ7rq+r2tGnvhV5/dSZnE9NryTAiAKRQefqR1pTCMuF74bgP0tf39p8Wof5uLHORoPwuGxhAEhAwPozvqDrjd+wASuuwQP/krrkf+e3OzpMn8ke4Ud+BQ7ACICApJMZBvzWiavLN7nievKQoylwPoffLkXZUIgGHF4HgwaGHHAcVJUAACAAAAAgAAAAIABAAAACwAAAAAA',
    );
  });

  it('the multiSign transaction signer count cannot less than requires', async () => {
    const txData = {
      inputs: multiSignUtxo,
      outputs: {
        to: '2N6Vk58WRh7gQYrRUBZAZ6j1bb81vR8G7F4',
        amount: 10110,
        fee: 1000,
        changeAddress: '2N8rqpUpbyJMtSXK6obH5GVufZ5rwE9fi5V',
      },
      version: 2,
      locktime: 0,
      requires: 2,
    };

    const testFn = async () => {
      try {
        const {txId, txHex} = await xtn.generateMultiSignTransaction(txData, [
          kp1,
        ]);
      } catch (e) {
        throw new Error(e);
      }
    };

    await expect(testFn()).rejects.toThrow();
  });
});
