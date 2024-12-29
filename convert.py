import csv
import json
import os

def convert_tsv_to_json(input_file):
    """
    This function converts a TSV file to a JSON file.
    """
    try:
        with open(input_file, encoding='utf-8', newline='') as file:
            csvreader = csv.reader(file, delimiter='\t')
            data = [row for row in csvreader]

        if len(data) > 2:
            data = data[2:]  # Skip the first two rows
        else:
            data = []

        output_file = os.path.splitext(input_file)[0] + '.json'

        with open(output_file, "w", encoding="utf-8") as json_file:
            json.dump(data, json_file, indent=4, ensure_ascii=False)

        print(f'Successfully converted {input_file} to {output_file}')

    except FileNotFoundError:
        print(f'Error: The file {input_file} was not found.')
    except Exception as e:
        print(f'An error occurred: {e}')

# Example usage
convert_tsv_to_json('Covers.txt')
convert_tsv_to_json('Contents.txt')
