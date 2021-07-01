<p align="center">
<img src="https://raw.githubusercontent.com/rishivijayv/screenshots/main/limage/limageBanner.png" />
<br />
</p>


# Overview
Limage allows users to share, save, and search for images uploaded by other users based on **labels** associated with an image. Users can discover new images, save them to refer back for later. Limage automatically creates albums for each label that the user has saved an image, making it extremely easy to use and get started. 

# Tech Stack
This repository contains the code corresponding to the **GraphQL API** that is served by **Express**. I use **TypeORM** to interact with the **PostgreSQL** database. Images uploaded by users are saved in **AWS S3**. Here is a brief description of the code in some of the key directories in the [src](https://github.com/rishivijayv/limage-server/tree/main/src) directory:
| Directory       | Information |
| --------------- | ------------- |
| entities        | TypeORM entities representing the tables in the PostgreSQL database  |
| gql-types       | Some input and return types for GraphQL resolvers |
| middleware      | Utilities that process incoming requests before the resolver code is executed |
| utilities       | Helper functions used in other directories |
| resolvers       | GraphQL resolvers which process requests from the client |

You can find the code containing the code for the frontend for Limage [here](https://github.com/rishivijayv/limage-frontend)

# Demo
Let's see how a normal user would interact with Limage, from them discovering it for the first time to saving images found on the platform and even uploading some images of their own. All images used in this demo are taken from [Pexels](https://www.pexels.com/). The credits to the original uploaders of the images can be found at the end of this README document.

## Discovering Limage
Let's say Patrick stumbles upon Limage for the first time, and wants to find images of some **food** items. They first see what sort of images Limage has to offer by using the **Discover** feature without creating an account. On doing so, they find some images they'd like to save to refer back to later, but are then redirected to create an account so that Limage can keep track of the saved images for them.
![discoverPreLogin](https://raw.githubusercontent.com/rishivijayv/screenshots/main/limage/discoverPreLogin.gif)

## Account Creation
Patrick then creates a Limage account, after which they are redirected to their home page. They see **three** different tabs/panes. **Images** displays all images that Patrick has uploaded to Limage (which at the moment are none). **Labels** displays all labels for which Patrick has saved images, neatly arranged into albums so that they can find images corresponding to one label in a single page (which, again, is empty at the moment). Finally, **Upload** allows Patrick to upload an image of their own.
![signup](https://raw.githubusercontent.com/rishivijayv/screenshots/main/limage/signup.gif)

## Saving Images
Now that they have created an account, Patrick goes back to Discover new **food** images. After clicking on the picture to have a better to look to make sure they like it, Patrick clicks on the **Save** button, which quickly saves the image in a **~food~** labeled album which can be found under the **Labels** pane now. But before going back to look at the saved image, Patrick decides to see what other images related to food Limage has, which they can easily do by clicking on the **Load More** button to load a few images each time, which is possible because Limage supports Pagination. 
![discover](https://raw.githubusercontent.com/rishivijayv/screenshots/main/limage/discover.gif)

## Saved Labels as Albums
Patrick now goes back to their home page and navigates to the **Lagels** pane, where they see an album titled **~food~** that Limage conviniently created for them, which now contains all the images that Patrick has ever saved under the that were labeled using **food**, in the order in which they saved them. Neat! :\)
![labels](https://raw.githubusercontent.com/rishivijayv/screenshots/main/limage/labels.gif)

## Uploading Images
After being on the platform for a while, Patrick now decides that they wish to upload an image of their own. Being a big fan of astronomy, Patrick has a few **space** related images that they'll like to share with everyone! So, they navigate to the **Upload** pane, select the image from their computer (not visible in the GIF to maintian some anonymity for Patrick's computer and its organization) and gets a small preview of the image they are uploading. Limage reminds them that every image needs to have a label associated with it. Patrick then adds the **space** label for the image, and clicks **Submit**. Limage quickly uploads this image for Patrick, and to verify the upload, Patrick hovers over to the **Images** pane, where they now see their uploaded image, immediately after they uploaded it (no refresh necessary!)
![upload](https://raw.githubusercontent.com/rishivijayv/screenshots/main/limage/upload.gif)

## Image Deletion
Patrick realize that they might have gone a little over the top and uploaded too many images, and decide they want to delete all images labeled with **landscape**. They see that the latest image they uploaded had the **landscape** label, and so quickly delete it. Limage quickly processes the deletion, and then automatically loads the next image in Patrick's uploaded image list. Patrick wants to delete all their **landscape** labeled images, and so they decide to load all their images, do a quick search for those with the **landscape** label - made easy with Limage's ability to filter images by labels, and then delete the other image with the **landscape** label. With that, Patrick has deleted all landscape images that they uploaded, easy as cake!
![delete](https://raw.githubusercontent.com/rishivijayv/screenshots/main/limage/delete.gif)

# Image Credits
## Images labeled with **food**
1. [Flat Lay Photography of Vegetable Salad on Plate](https://www.pexels.com/photo/flat-lay-photography-of-vegetable-salad-on-plate-1640777/) by Ella Olsson
2. [Selective Focus Photography of Pasta with Tomato and Basil](https://www.pexels.com/photo/selective-focus-photography-of-pasta-with-tomato-and-basil-1279330/) by Lisa
3. [Vegetable Sandwich on Plate](https://www.pexels.com/photo/vegetable-sandwich-on-plate-1095550/) by Daria Shevtsova
4. [Assorted Sliced Fruits in White Ceramic Bowl](https://www.pexels.com/photo/assorted-sliced-fruits-in-white-ceramic-bowl-1092730/) by Jane D.

## Images labeled with **space**
1. [Snow Light Landscape People](https://www.pexels.com/photo/snow-light-landscape-people-4456224/)by Dylan
2. [Starry Night](https://www.pexels.com/photo/starry-night-574116/) by Sheena Wood
3. [A Clear Sky at Night](https://www.pexels.com/photo/a-clear-sky-at-night-2885320/) by Roberto Nickson
4. [Body of Water Under Green and Blue Sky](https://www.pexels.com/photo/body-of-water-under-green-and-blue-sky-2113558/) by Tobias Bjørkli

## Images labeled with **landscape**
1. [Photo of Forest with Fog](https://www.pexels.com/photo/photo-of-forest-with-fog-1671324/) by 
Francesco Ungaro
