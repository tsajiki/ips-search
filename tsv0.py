import csv
import json

filename = 'Contents0.txt'
with open(filename, encoding='utf8', newline='') as fp:
    csvreader = csv.reader(fp, delimiter='\t')
    output = [row for row in csvreader]  # 各年のデータを要素とするリスト
    #content = []
    #for row in csvreader:
    #    content.append(row)

# print(output)

with open("Contents0.json", "w", encoding="utf-8") as fp :
	json.dump(output, fp, indent="\t", ensure_ascii=False)