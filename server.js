// server.js

const express = require('express');
const { Application, HTTPAPIPlugin, HTTPBasePlugin } = require('lisk-sdk');

const app = express();
const port = process.env.PORT || 3000;

// Initialize Lisk application
const appInstance = Application.defaultApplication();

// Register HTTP API plugin
appInstance.registerPlugin(HTTPAPIPlugin);

// Register custom HTTP endpoint for triggering the smart contract
appInstance.registerPlugin({
  alias: 'custom-http-endpoint',
  plugin: HTTPBasePlugin,
  config: {
    whiteList: ['http://localhost:3000'],
  },
});

// Define a custom HTTP endpoint for transactions
app.post('/transactions/generate-wallet-account', async (req, res) => {
  try {
    // Create a transaction to trigger the smart contract
    const transaction = await appInstance
      .getPluginController('custom-http-endpoint')
      .createTransaction({
        moduleID: 2, // Transfer module
        assetID: 0, // Transfer asset
        passphrase: 'your-secret-passphrase', // Replace with your secret passphrase
        fee: '10000000', // Transaction fee in beddows
        assets: {
          // Define asset data for the smart contract
          moduleAssetId: 'generateWalletAccount',
          // Add additional asset data here if needed
        },
      });

    // Broadcast the transaction to the network
    await appInstance.getPluginController('custom-http-endpoint').broadcast(transaction);

    res.json({ success: true, message: 'Transaction sent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
