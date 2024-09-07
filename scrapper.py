import sys
from bs4 import BeautifulSoup
import requests
import statistics


def fetch_html(url):
    response = requests.get(url)
    if response.status_code == 200:
        return response.text
    else:
        print(f"Error: Failed to fetch HTML with status code {response.status_code}", file=sys.stderr)
        return None


def get_table_column_mean(html_content, column):
    soup = BeautifulSoup(html_content, 'html.parser')
    name = soup.find('h1', class_='m-b-0').text.strip()
    table = soup.find('table')
    if table is None:
        print("Error: No table found in the HTML")
        sys.exit(1)

    column = column.replace("_", " ")

    index = -1
    if column != "-":
        heades = table.find('thead').find('tr').find_all('th')
        for i in range(1, len(heades)):
            if heades[i].text.strip() == column:
                index = i - 1
                break
    else:
        index = 0

    if index == -1:
        print(
            "Error: column " + ("'" + column + "'" if column != "-" else "") + f"not found for item {name}",
            file=sys.stderr)
        return -1

    rows = table.find('tbody').find_all('tr')

    values = []
    for row in rows:
        cols = row.find_all('td')
        if len(cols) >= index + 2:
            a_tag = cols[index + 1].find('a')
            if a_tag is not None:
                try:
                    value_text = a_tag.text.strip().replace('$', '').replace(',', '')
                    value = float(value_text)
                    values.append(value)
                except ValueError:
                    print(f"Warning: Skipping invalid value '{a_tag.text}' for item {name}", file=sys.stderr)

    if not values:
        print(f"Warning: price for {name} is unavailable", file=sys.stderr)
        return -1

    diff_factor = 3
    med = statistics.median(values)

    values = [x for x in values if diff_factor > x / med > 1 / diff_factor]

    mean_value = sum(values) / len(values)
    return round(mean_value, 2)


def main():
    if len(sys.argv) % 2 == 0:
        print("Usage: python script.py [{<url>, <wear>}]")
        sys.exit(1)
    mean_values = []

    for i in range((len(sys.argv) - 1) // 2):
        url = sys.argv[2 * i + 1]
        column = sys.argv[2 * i + 2]

        html_content = fetch_html(url)
        if html_content is not None:
            mean_values.append(get_table_column_mean(html_content, column))
        else:
            mean_values.append(-1)

    res = " ".join(map(str, mean_values))
    print(res)


if __name__ == "__main__":
    main()
