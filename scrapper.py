import sys
from bs4 import BeautifulSoup
import requests


def fetch_html(url):
    response = requests.get(url)
    if response.status_code == 200:
        return response.text
    else:
        print(f"Error: Failed to fetch HTML with status code {response.status_code}")
        sys.exit(1)


def get_table_column_mean(html_content, column_number):
    soup = BeautifulSoup(html_content, 'html.parser')

    table = soup.find('table')
    if table is None:
        print("Error: No table found in the HTML")
        sys.exit(1)

    rows = table.find('tbody').find_all('tr')

    values = []
    for row in rows:
        cols = row.find_all('td')
        if len(cols) >= column_number + 2:
            a_tag = cols[column_number + 1].find('a')
            if a_tag is not None:
                try:
                    value_text = a_tag.text.strip().replace('$', '')
                    value = float(value_text)
                    values.append(value)
                except ValueError:
                    pass
                    # print(f"Warning: Skipping invalid value '{a_tag.text}' in row: {row}")

    if not values:
        print(-1)
        sys.exit(1)

    mean_value = sum(values) / len(values)
    print(f"{mean_value:.2f}")


def main():
    if len(sys.argv) % 2 == 0:
        print("Usage: python script.py [{<url>, <column_number>}]")
        sys.exit(1)
    mean_values = []

    for i in range((len(sys.argv) - 1) // 2):
        url = sys.argv[2 * i + 1]
        try:
            column_number = int(sys.argv[2 * i + 2])
        except ValueError:
            print("Error: Column number must be an integer")
            sys.exit(1)

        html_content = fetch_html(url)

        mean_values.append(get_table_column_mean(html_content, column_number))


if __name__ == "__main__":
    main()
