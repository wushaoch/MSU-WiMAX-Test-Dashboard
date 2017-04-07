#!/usr/bin/env python
import sys
import csv
import json
from collections import OrderedDict
import xml.etree.ElementTree as ET

def read_csv_file(filename):
    data = []
    while True:
        try:
            csvfile = open(filename, "r")
        except IOError:
            print("%s file not found. Try again." %(filename))
            filename = sys.stdin.readline()
            filename = filename.strip('\n')
            continue
        break
    rfile = csv.reader(csvfile)#reader does the work for list formatting
    for line in rfile :
        data.append(line) #add the formatted list to the data list
    return data

def write_geojson_file(filename, data, rows, title_data):
    with open(filename, "r") as existing:
        edata = existing.read()
    keys = ["index","latitude","longitude","throughput","data1","data2","time"]
    rows.remove(0)
    rows.remove(1)
    rows.remove(2)
    rows.remove(6)
    jfilecontents = []
    with open(filename, "w") as jsonfile:
        for line in data:
            for row in rows:
                entry = OrderedDict()
                entry["type"] = "Feature"
                properties = OrderedDict()
                properties[keys[row]] = line[row]
                properties["magType"] = "mb"
                entry["properties"] = properties
                geometry = OrderedDict()
                geometry["type"] = "Point"
                coordinates = []
                coordinates.append(line[2]) #longitude
                coordinates.append(line[1]) #latitude
                geometry["coordinates"] = coordinates
                entry["geometry"] = geometry
                entry["id"] = line[6] #timestamp
                jfilecontents.append(entry)
        title_data["features"]=jfilecontents
        title_data["bbox"] = [-179.6897, -60.5845, 0, 179.8707, 69.6244, 556.1]
        json.dump(title_data, jsonfile)
    
def print_options():
    print("Include which rows for json (space delimited)?")
    print("Row 3: Throughput\nRow 4: Data1\nRow 5: Data2\nExample: 4 5")
    print("Type 'all' to select every row.")
    rows = sys.stdin.readline()
    inc_rows = [0,1,2,6]
    if rows == 'all\n':
        inc_rows.extend([3,4,5])
    else:
        rows = rows.split()
        inc_rows.extend(rows)
        inc_rows.sort()
    for row in inc_rows:
        if str(row) not in "0123456":
            print("invalid rows")
            return
    print("Create new GeoJSON file (yes or no)?")
    y_n = sys.stdin.readline()
    options = [inc_rows, y_n]
    return options

def average_data(data, num, rows):
    averaged_data = []
    numlines = len(data[0])
    for line in range(numlines):
        avg_line = []
        for row in rows:
            avg = 0
            for entry in range(num):
                avg += float(data[int(entry)][int(line)][int(row)])/float(num) 
            avg_line.append(avg)
        averaged_data.append(avg_line)
    return averaged_data

def write_title(filename):
    with open(filename, "w") as titlefile:
        titlefile.write("datafeed_callback(")
        type_dict = OrderedDict()
        type_dict["type"] = "FeatureCollection"
        metadata = {}
        metadata["generated"] = 1490900696000
        metadata["title"] = "ECE480 Team 12 WiMAX Data Collection"
        metadata["status"] = 200
        metadata["api"]="1.5.7"
        metadata["count"]=255
        type_dict["metadata"] = metadata
        return type_dict
        
print("Number of csv files to be averaged: ")
csvs = int(sys.stdin.readline())
all_csvs = []
for i in range(csvs):
    print("CSV filename (input): ")
    csvfilename = sys.stdin.readline()
    csvfilename = csvfilename.strip('\n')
    csvdata = read_csv_file(csvfilename)
    all_csvs.append(csvdata)
options = print_options()
if options:
    avgd_data = average_data(all_csvs, csvs, options[0])
    print("JSON filename (output): ")
    jsonfilename = sys.stdin.readline()
    jsonfilename = jsonfilename.strip('\n')
    if jsonfilename[-4:] != 'json':
        print("Output file extension incorrect.")
    else:
        if options[1] == "yes\n":
            title_data = write_title(jsonfilename)
            write_geojson_file(jsonfilename, avgd_data, options[0], title_data)
        elif options[1] == "no\n":
            #title_data = retrieve_titledata()
            #write_geojson_file(jsonfilename, avgd_data, options[0], title_data)
            print("Adding to existing GeoJSON file feature not supported yet.")
        else:
            print("Not a valid response.")
