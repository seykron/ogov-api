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

## Import data
Importer job must run as cron job. Until then it's possible to start the importer as standalone process:
```
node app/importer.js
```

## Endpoints

### Bills
API calls to retrieve information about bills. Bills are available from 01/01/1991 until now.

#### /api/bills/list
Lists bills filtering by a range of dates.

Parameters:
 * {String | Number} fromDate Either timestamp or date String to filter bills from. Default is the current date, so bills are listed backward.
 * {String | Number} toDate Either timestamp or date String to filter bills to. Default is null, so there's no limit listing bills backward.
 * {Boolean} backward Indicates whether to list backward on time or not. If it's true, bills are listed since fromDate backward on time until toDate. If it's false bills are listed since fromDate forward on time until toDate. Default is true.

Examples:
```
/api/bills/list
/api/bills/list?from=09/12/2012&to=01/01/2012&backward=true
```

#### /api/bills/findByParties
Search for bills which subscribers belong to one of the specified parties.

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

#### /api/bills/findByPerson
Search for bills signed off by the specified person.

Parameters:
 * {String[]} personId Id(s) of the person that signed off required bills. Cannot be null or empty.
 * {String | Number} fromDate Either timestamp or date String to filter bills from. Default is the current date, so bills are listed backward.
 * {String | Number} toDate Either timestamp or date String to filter bills to. Default is null, so there's no limit listing bills backward.
 * {Boolean} backward Indicates whether to list backward on time or not. If it's true, bills are listed since fromDate backward on time until toDate. If it's false bills are listed since fromDate forward on time until toDate. Default is true.

Examples:
```
/api/bills/findByPerson?personId=50c51860eebb58f9c55afb54
/api/bills/findByParties?personId=50c51860eebb58f9c55afb54&from=09/12/2012&to=01/01/2012&backward=true
```

### People
API calls to retrieve information about people envolved with bills.

#### /api/people/list
List people according to specified information.

Parameters:
 * {String} [party] Required person party.
 * {String} [province] Required person province.
 * {String} [name] Required person name. Can be a regexp.

Examples:
```
/api/people/list
/api/people/list?name=Cristina
/api/people/list?name=^Solanas
```

#### /api/people/findByParties
Search for people that belong to the specified parties.

Parameters:
 * {String[]} parties List of parties which required people belong to. Cannot be null.
 * {String} [province] Required person province.
 * {String} [name] Required person name. Can be a regexp.

Examples:
```
/api/people/findByParties?parties=FRENTE%20PARA%20LA%20VICTORIA%20-%20PJ,UCR
/api/people/findByParties?parties=FRENTE%20PARA%20LA%20VICTORIA%20-%20PJ,UCR&&name=CARLOS
```

#### /api/people/numberOfPresentedBills
Returns the number of presented bills by person.

Parameters:
 * {String} [party] Required person party.
 * {String} [province] Required person province.
 * {String} [name] Required person name. Can be a regexp.

Examples:
```
/api/people/numberOfPresentedBills
/api/people/numberOfPresentedBills?province=SALTA
```
