# Thin airfoil

Thin airfoil in a steady unseparated supersonic flow of air

## Development

Requirements: `git` command-line utility, web-browser, `npm` (if you want to publish changes to `github.io`)

It's recommended to learn about `git`: go http://git-scm.com/doc

### 1. Checkout

```shell
$ git clone git@github.com:eakorolev/airfoil.git # or use your fork
$ cd airfoil
```

### 2. Edit

Just edit files :) You can check results by opening `index.html` in web-browser

### 3. Save changes

```shell
$ git add .
$ git commit
$ git push
```

### 4. Publish to `github.io`

  1. First time, you need to install npm-packages and maybe `grunt-cli`

    ```shell
    # npm install grunt-cli -g
    $ npm install
    ```

  2. Build minimized files

    ```shell
    $ grunt build
    ```

    Now you can check built file: open `.grunt/build/index.html` in web-browser

  3. Publish files to `github.io`

    If minimized code works fine, it's time to publish it!

    ```shell
    $ grunt gh-pages
    ```

    You can use `grunt-gh-pages`'s params like `--gh-pages-tag 'v1.2.3' --gh-pages-message 'Tagging v1.2.3'`

  4. Open http://eakorolev.github.io/airfoil/ (`http://<your_github_login>.github.io/<your_repo_name>/` in common)
