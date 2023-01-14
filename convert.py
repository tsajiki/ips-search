import csv
import json
import os

def func_convert(input_file):

	with open(input_file, encoding='utf8', newline='') as fp:
		csvreader = csv.reader(fp, delimiter='\t')
		output = [row for row in csvreader]

		output.pop(0)
		output.pop(0)
		#print(output)

	output_file = os.path.splitext(os.path.basename(input_file))[0]
	output_file += '.json'
	
	with open(output_file, "w", encoding="utf-8") as fp:
		json.dump(output, fp, indent="\t", ensure_ascii=False)

func_convert('Covers.txt')
func_convert('Contents.txt')