# eip-mongo

Enterprise Integration Patterns for javascript mongodb adapter.

Create a mongodb store to be used in aggregator that is using mongodb to store aggregations.
Aggregate events through many nodes.

# Dependencies

In order for this module to work a mongoose connection is required.
Make sure you connect to mongo using mongoose > 4.0.0

## Installation

```
npm install --save eip-mongo
```

## Usage

```javascript
const eip = require('eip');
const { Store } = require(eip-mongo)
const store = new Store(3600) // ttl to delete from mongo after 3600 sec
const aggregator = new eip.Route().aggregate({ store });
```


## License

MIT
