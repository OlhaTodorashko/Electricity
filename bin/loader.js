var fs = require('fs'),
    parse = require('csv-parse'),
    filter = require('stream-filter'),
    json = require('JSONStream'),
    map = require('map-stream'),
    dataPath = 'data/household_power_consumption.txt';


var loader = (function () {

    var parserParams = {
            delimiter: ';',
            columns: true,
            auto_parse: true
        },
        validateDate = {
            dmy: function (date) {
                var date = date.split('/');
                return new Date(date[2], date[1] - 1, date[0]);
            },
            mdy: function (date) {
                var date = date.split('/');
                return new Date(date[2], date[0] - 1, date[1]);
            }
        };

    function parserStream() {
        return parse(parserParams);
    }

    function filterStream(filterData) {
        var type = filterData.type,
            start = validateDate.mdy(filterData.start),
            end = validateDate.mdy(filterData.end),
            filterStream = filter(function (record) {
                var date = validateDate.dmy(record[type]);
                record[type] = date;

                if (date > end) {
                    filterStream.end();
                }

                return date >= start && date <= end;
            });

        return filterStream;
    }

    function jsonStream() {
        return json.stringify();
    }

    function mapStream() {
        return map(function (data, callback) {
            var date = data.Date,
                time = data.Time.split(':');

            date.setHours(time[0]);
            date.setMinutes(time[1]);

            var formattedRecord = {
                x: date.getTime(),
                y: data.Voltage
            };

            callback(null, formattedRecord);
        });
    }

    return {
        createParseStream: parserStream,
        createFilterStream: filterStream,
        createJsonStream: jsonStream,
        createMapStream: mapStream,
        getData: function (filterData) {

            var that = this,
                data = dataPath,
                input = fs.createReadStream(data);

            return input.pipe(that.createParseStream()).pipe(that.createFilterStream(filterData)).pipe(that.createMapStream()).pipe(that.createJsonStream());
        }
    };
}());

module.exports = loader;
