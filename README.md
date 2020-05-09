# Gridsome menu source plugin

This Gridsome plugin will source infinitely nested 'menu'
data.

Currently the plugin will only work with JSON in the
following format:

```json
{
  "id": "main",
  "name": "Main menu",
  "links": [
    {
      "link": {
        "title": "Animals",
        "url": "/animals"
      },
      "children": [
        "link": {
          "title": "Ponies",
          "url": "/animals/ponies"
          "children" []
        },
        "link": {
          "title": "Horses",
          "url": "/animals/horses"
          "children": [
            "title": "Minature",
            "url": "/animals/horses/minature"
          ]
        }
      ]
    },
    {
      "link": {
        "title": "Animals",
        "url": "/animals"
      },
      "children": []
    }
  ]
}
```