# Argentina's Open Goverment API

## Requirements
MongoDB service installed and running.

## Usage
```
node app
```
The application runs on port 3000:
```
http://localhost:3000/
```

## Endpoints

### /api/bills/list
Parameters:
 * {String | Number} fromDate Either timestamp or date String to filter bills from. Default is the current date, so bills are listed backward.
 * {String | Number} toDate Either timestamp or date String to filter bills to. Default is null, so there's no limit listing bills backward.
 * {Boolean} backward Indicates whether to list backward on time or not. If it's true, bills are listed since fromDate backward on time until toDate. If it's false bills are listed since fromDate forward on time until toDate. Default is true.

Examples:
```
/api/bills/list
/api/bills/list?from=09/12/2012&to=01/01/2012&backward=true
```

### /api/bills/findByParties
Parameters:
 * {String[]} parties List of parties to match in bills. Cannot be null.
 * {String | Number} fromDate Either timestamp or date String to filter bills from. Default is the current date, so bills are listed backward.
 * {String | Number} toDate Either timestamp or date String to filter bills to. Default is null, so there's no limit listing bills backward.
 * {Boolean} backward Indicates whether to list backward on time or not. If it's true, bills are listed since fromDate backward on time until toDate. If it's false bills are listed since fromDate forward on time until toDate. Default is true.

Examples:
```
/api/bills/findByParties?parties=UCR
/api/bills/findByParties?parties=UCR,FRENTE PERONISTA&from=09/12/2012&to=01/01/2012&backward=true
```
