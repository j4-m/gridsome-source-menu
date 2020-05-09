# Gridsome menu source plugin

This Gridsome plugin will source infinitely nested 'menu'
data.

## Install

`yarn add gridsome-source-menu`

Or

`npm install --save gridsome-source-menu`

## Usage

The plugin is currently limited to working with JSON sources
with the following schema:

```json
{
  "name": "Main menu",
  "id": "main",
  "links": [
    {
      "link": {
        "title": "Horses",
        "url": "/horses"
      },
      "children": [
        {
          "link": {
            "title": "Mustang",
            "url": "/horses/mustang"
          }
        },
        {
          "link": {
            "title": "Pony",
            "url": "/horses/pony"
          }
        }
      ]
    },
    {
      "link": {
        "title": "Dinosaurs",
        "url": "/dinosaurs"
      }
    }
  ]
}
```

If the above JSON was placed in a file at `src/content/menu/main.json`
then the plugin could be configured as follows in your `girdsome.config.js`:

```js
module.exports = {
  plugins: [
    {
      use: 'gridsome-source-menu',
      options: {
        path: 'src/content/menus/**/*.json'
      }
    }
  ]
}
```

You could then query the menu data from your components using:

```graphql
{
  menu(id: "main") {
    name
    links {
      url
      title
      order
      children {
        url
        title
      }
    }
  }
}
```

Which would produce the following result:

```graphql
{
  "data": {
    "menu": {
      "name": "Main menu",
      "links": [
        {
          "url": "/horses",
          "title": "Horses",
          "order": 0,
          "children": [
            {
              "url": "/horses/mustang",
              "title": "Mustang"
            },
            {
              "url": "/horses/pony",
              "title": "Pony"
            }
          ]
        },
        {
          "url": "/dinosaurs",
          "title": "Dinosaurs",
          "order": 1,
          "children": []
        }
      ]
    }
  }
}
```

## Netlify CMS

Netlify CMS can be easily configured to produce the 
menu data in the format expected by this plugin:

```yml
backend:
  name: git-gateway
media_folder: "static/images/uploads"
public_folder: "/images/uploads"
collections:
  - label: "Menus"
    name: "menus"
    folder: "src/content/menus"
    format: json
    create: true
    link_field: &link_field
      label: Link
      name: link
      widget: object
      fields:
        - {label: "Title", name: "title", widget: "string", hint: "The text that will become a link"}
        - {label: "URL", name: "url", widget: "string", hint: "e.g. /about or https://www.example.com"}
    fields:
      - {label: "ID", name: "id", widget: "string", required: true}
      - {label: "Name", name: "name", widget: "string", required: true}
      -
        label: "Links"
        name: "links"
        widget: "list"
        collapsed: false
        fields:
          - *link_field
          - label: "Child links"
            name: "children"
            widget: "list"
            field: *link_field
```
