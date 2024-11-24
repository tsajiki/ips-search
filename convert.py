#0.使用方法
#1.食虫植物研究会々誌データの入力ファイル（Covers.txt、Contents.txt）をディレクトリ C:\Work に置く。
#2.Anaconda Prompt を開く。
#3.convert.py を実行する。C:\Work>python convert.py
#4.出力ファイル（Covers.json、Contents.json）ができる。

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