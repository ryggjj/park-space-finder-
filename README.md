# park-space-finder-

# Parking Space Map - Search and Edit
View the parking Spaces marked by users on the home page map. Users can simply enter the longitude and latitude by themselves.

## operation

Open it with a browser `index.html`，Or use a local static server：

```bash
python3 -m http.server 8000
# or
npx serve .
```

visit http://localhost:8000。

## function

- **Home Page Map**：use Leaflet + OpenStreetMap，non eed API Key. Upon entering the page, all saved parking space markers are displayed (automatically zooming to include all markers).
- **The user inputs the longitude and latitude**：When adding or editing parking Spaces, fill in "latitude" and "longitude" (such as 31.23, 121.47). After saving, the point will be displayed on the map.
- ** Filter ** : All/Only free.
- "Search" : Search by name or address.
- **location**：The button at the lower right corner can be used to locate the current position.
- **edit car space **：type （pay metre / free ）、duration of free time 、name 、address 、total car space 、current space available、**Latitude and longitude**。
- **data**：store at browser **localStorage**，keep after refresh.

## technology

- front end ：HTML + CSS + JavaScript
- map ：Leaflet + OpenStreetMap（No key required）
- data ：localStorage
