# Bulletin Board

## Introduction / Summary

Bulletin Board is a message board style application. Users can submit messages and/or images for approval and an admin can approve the message so that it can be added to the world. Scenes are preconstructed with "anchor" assets used as placeholders to determine where approved messages will be placed. If there are no more un-used spaces, Bulletin Board looks for existing dropped message assets, chooses one in random, and then changes the text and/or image of the dropped asset to the latest message.

## Key Features

### Canvas elements & interactions

- Key Asset: When clicked this asset will open the drawer and allow users and admins to start interacting with the app. Users can submit messages and/or images that, upon approval from an admin, will display in world
- Anchor Assets: Throughout the scene there are various assets placed with the unique name "anchor". These will help the app identify where to place the approved messages and/or images.

### Admin features

- Access: Click on the key asset to open the drawer and then select the Admin tab. Any changes you make here will only affect this instance of the application and will not impact other instances dropped in this or other worlds.
- Settings: Use the dropdown to select a theme and update the Title, Subtitle, and Description that all users will see when they open the drawer.
- Pending Messages: Review pending messages and approve or delete accordingly. Approving will immediately drop the message/image in the world within the scene. Delete will delete the message from the data object and permanently delete any image that has been upload to S3.

### Themes description

- Chalk the Block (default): A spiraling sidewalk theme that will replace sections of the sidewalk with approved images.
- Gratitude Garden: A garden theme that when selected will drop signs with approved messages throughout the scene
- Friendship Garden: A garden theme that when selected will drop flowers with approved messages throughout the scene

### Data objects

- Key Asset: the data object attached to the dropped key asset can optionally store a theme id if you'd like the initial setup to be something other than Chalk the Block i.e. `{ themeId: "GRATITUDE" }. See Theme Defaults below for additional info and options.
- World: the data object attached to the world will store all information for each dropped scene indexed by `dropSceneId`. Data structure:
  - anchorAssets: an array of all of the dropped asset ids populated the first time the Key Asset is clicked,
  - messages: a map indexed by messageId for each submitted message which includes the following properties `id, approved, imageUrl, message, userId, and username`,
  - theme: theme settings which include `id ("CHALK", "GRATITUDE", or "FRIENDSHIP), description, title, and subtitle`,
  - usedSpaces: an array of all of the anchorAssets that have been used to place an approved message thus far

#### Theme Defaults:

Below are the defaults for each theme. If you want to change the theme options when dropping the scene instead of using the Admin menu, you can change any or all the parameters below, defaults will be used to fill in the blanks once the app is used for the first time.

```json
{
  "themeId": "CHALK",
  "theme": {
    "description": "Upload an image below and click submit. Once it's approved, it will be added to the world.",
    "subtitle": "Add a picture to add to the virtual sidewalk.",
    "title": "Chalk the Block",
    "type": "image"
  }
}
```

```json
{
  "themeId": "FRIENDSHIP",
  "theme": {
    "description": "Enter a messages below and click Submit. Once it's approved it will be added to the garden.",
    "subtitle": "Leave a message about something you're thankful for.",
    "title": "Friendship Garden",
    "type": "message"
  }
}
```

```json
{
  "themeId": "GRATITUDE",
  "theme": {
    "description": "Enter a messages below and click Submit. Once it's approved it will be added to the garden.",
    "subtitle": "Leave a message about something you're thankful for.",
    "title": "Gratitude Garden",
    "type": "message"
  }
}
```

## Developers:

### Getting Started

- Clone this repository
- Run `npm i` in server
- `cd client`
- Run `npm i` in client
- `cd ..` back to server

### Add your .env environmental variables

```json
API_KEY=xxxxxxxxxxxxx
INSTANCE_DOMAIN=api.topia.io
INSTANCE_PROTOCOL=https
INTERACTIVE_KEY=xxxxxxxxxxxxx
INTERACTIVE_SECRET=xxxxxxxxxxxxxx
S3_BUCKET=topia-dev-test
DEFAULT_THEME=CHALK
SCENE_ID_GRATITUDE=xxxxxxxxxxxxxx
DROPPABLE_SCENE_IDS_GRATITUDE=xxxxxxxxxxxxxx,xxxxxxxxxxxxxx,xxxxxxxxxxxxxx
SCENE_ID_FRIENDSHIP=xxxxxxxxxxxxxx
DROPPABLE_SCENE_IDS_FRIENDSHIP=xxxxxxxxxxxxxx,xxxxxxxxxxxxxx,xxxxxxxxxxxxxx
SCENE_ID_CHALK=xxxxxxxxxxxxxx
```

### Where to find API_KEY, INTERACTIVE_KEY and INTERACTIVE_SECRET

[Topia Dev Account Dashboard](https://dev.topia.io/t/dashboard/integrations)

[Topia Production Account Dashboard](https://topia.io/t/dashboard/integrations)

### Helpful links

- [SDK Developer docs](https://metaversecloud-com.github.io/mc-sdk-js/index.html)
- [View it in action!](topia.io/bulletin-board-prod)
- [Notion One Pager](https://www.notion.so/topiaio/Bulletin-Board-18171cde990b447693aee8b26b03f872?pvs=4)
