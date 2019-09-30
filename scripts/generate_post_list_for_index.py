#!/usr/bin/env python
##~---------------------------------------------------------------------------##
##                        _      _                 _   _                      ##
##                    ___| |_ __| |_ __ ___   __ _| |_| |_                    ##
##                   / __| __/ _` | '_ ` _ \ / _` | __| __|                   ##
##                   \__ \ || (_| | | | | | | (_| | |_| |_                    ##
##                   |___/\__\__,_|_| |_| |_|\__,_|\__|\__|                   ##
##                                                                            ##
##  File      : generate_post_list_for_index.py                               ##
##  Project   : site                                                          ##
##  Date      : Nov 06, 2018                                                  ##
##  License   : GPLv3                                                         ##
##  Author    : stdmatt <stdmatt@pixelwizards.io>                             ##
##  Copyright : stdmatt - 2018                                                ##
##                                                                            ##
##  Description :                                                             ##
##    Tranverses the posts directory and create an html entry for each        ##
##    post that it found. So we don't ever need to care about generate        ##
##    by hand the posts that we written                                       ##
##                                                                            ##
##---------------------------------------------------------------------------~##


##----------------------------------------------------------------------------##
## Imports                                                                    ##
##----------------------------------------------------------------------------##
import os;
import time;
import datetime;
import pprint as pp;

##----------------------------------------------------------------------------##
## Constants                                                                  ##
##----------------------------------------------------------------------------##
SCRIPT_PATH            = os.path.dirname(os.path.realpath(__file__));
PROJECT_ROOT           = os.path.abspath(os.path.join(SCRIPT_PATH, ".."));
POSTS_PATH             = os.path.join(PROJECT_ROOT, "posts");

BLOG_OUTPUT_INDEX_FILENAME   = os.path.join(PROJECT_ROOT, "blog.html");
BLOG_INDEX_TEMPLATE_FILENAME = os.path.join(SCRIPT_PATH,  "blog_index_template.html");

META_TAGS = [
    "Title:",
    "Date:",
    "Additional:"
];

POST_ITEM_INDEX_DATE    = 0;
POST_ITEM_INDEX_SECTION = 1;
POST_ITEM_INDEX_TITLE   = 2;
POST_ITEM_INDEX_URL     = 3;

##----------------------------------------------------------------------------##
## Helper Functions                                                           ##
##----------------------------------------------------------------------------##
##------------------------------------------------------------------------------
def clean_the_meta_line(line):
    ##
    ## Remove the html comments.
    line = line.strip().replace("<!--", "").replace("-->", "").strip();
    return line;

##------------------------------------------------------------------------------
def clean_spaces_and_new_lines(line):
    return line.replace("\n", "").strip(" ");

##------------------------------------------------------------------------------
def extract_post_item_info(fullpath, section_name):
    f = open(fullpath);

    ##
    ## Read the meta info.
    info = {};
    while(True):
        line = f.readline();
        line = clean_spaces_and_new_lines(line);

        if(len(line) == 0):
            continue;
        if(not line.startswith("<!--")):
            break;

        line = clean_the_meta_line(line);
        for meta_tag in META_TAGS:
            if(line.startswith(meta_tag)):
                info[meta_tag] = line[len(meta_tag):].strip();
                break;

    ##
    ## Read the rest of the file.
    info["content"] = [];
    while(True):
        line = f.readline();
        if(len(line) == 0):
            break;

        info["content"].append(clean_spaces_and_new_lines(line));

    f.close();

    ##
    ## We need to do that becuase the relative path will become the URL
    ## for the <a href="..."> at the index.html.
    base_path      = os.path.commonprefix((fullpath, PROJECT_ROOT));
    relative_path  = fullpath.replace(base_path, ".");
    info["relative_path"] = relative_path;

    pp.pprint(info);
    return info;

##------------------------------------------------------------------------------
def sort_section_posts(posts_list):
    sorter = lambda post_item: time.mktime(
        datetime.datetime.strptime(post_item[0], "%d/%m/%Y").timetuple()
    );
    posts_list.sort(key=sorter, reverse=True);

    for i in xrange(0, len(posts_list)-1):
        post_a = posts_list[i];
        post_b = posts_list[i+1];

        if(sorter(post_a) == sorter(post_b)):
            # print post_a[2], sorter(post_a);
            # print post_b[2], sorter(post_b);

            if(os.path.getctime(post_a[3]) <= os.path.getctime(post_b[3])):
                posts_list.pop(i);
                posts_list.insert(i+1, post_a);
                # print post_a[2], sorter(post_a);
                # print post_b[2], sorter(post_b);

            print "---";

##------------------------------------------------------------------------------
def clear_section_name(section_dir):
    section_dir = os.path.basename(section_dir);
    index = section_dir[0];
    name  = section_dir[2:];
    return name, int(index);

##------------------------------------------------------------------------------
def create_arr(size):
    arr = [];
    for i in xrange(size):
        arr.append([]);
    return arr;

##------------------------------------------------------------------------------
def generate_html(sections_list):
    html = "";
    for section in sections_list:
        if(len(section) == 0):
            continue;

        section_name = section[0][POST_ITEM_INDEX_SECTION];

        html += """<div style="text-transform: uppercase;" "="">""";
        html += """<b>%s</b>""" % section_name;
        html += """</div><hr>""";

        last_year = None;
        for post in section:
            date  = post[POST_ITEM_INDEX_DATE ];
            title = post[POST_ITEM_INDEX_TITLE];
            url   = post[POST_ITEM_INDEX_URL  ];

            year = date.split("/")[2];
            if(last_year != year):
                if(last_year is not None):
                    html += "<br>";
                last_year = year;


            html += """%s: <a href="%s">%s</a><br>""" % (date, url, title);

        html += "<br>";
    return html;

##------------------------------------------------------------------------------
def insert_resulting_html(html_to_insert, template_filename):
    lines = [];
    f = open(template_filename, "r");
    for line in f.readlines():
        if(line.strip() == "__SECTIONS_AND_POSTS_LISTS_TO_BE_REPLACED__"):
            line = html_to_insert;
        lines.append(line);
    return ("").join(lines);


def is_hidden_path(path):
    return os.path.basename(path).startswith(".");

##----------------------------------------------------------------------------##
## Entry Point                                                                ##
##----------------------------------------------------------------------------##
##------------------------------------------------------------------------------
def main():
    ##
    ## Gather the information for each and every post inside the ./posts directory.
    section_dirs = os.listdir(POSTS_PATH);
    sections     = create_arr(len(section_dirs));
    posts_to_do  = [];

    for section_dir in section_dirs:
        section_dir = os.path.join(POSTS_PATH, section_dir);
        if(is_hidden_path(section_dir)):
            continue;

        section_name, section_index = clear_section_name(section_dir);
        for post_dir in os.listdir(section_dir):
            full_post_path  = os.path.join(section_dir, post_dir);
            if(is_hidden_path(full_post_path)):
                continue;

            print("Processing:", full_post_path);
            post_item_info = extract_post_item_info(full_post_path, section_name);

            # ##
            # ## @notice(stdmatt): We're setting the __ (double underscores)
            # ## title prefix as a way to indicate that the post isn't completed
            # ## yet, so we won't add it to the sections, but to another list
            # ## that will be printed to remember us to write the post.
            # if(post_item[POST_ITEM_INDEX_TITLE].startswith("__")):
            #         posts_to_do.append(post_item);
            # else:
            #     sections[section_index].append(post_item);

        # sort_section_posts(sections[section_index]);

    # ##
    # ## Generate the sections and posts html that will be inserted on index.html
    # html = generate_html(sections);

    # ##
    # ## Generate the final index.html
    # index_page = insert_resulting_html(html, BLOG_INDEX_TEMPLATE_FILENAME);

    # f = open(os.path.join(PROJECT_ROOT, BLOG_OUTPUT_INDEX_FILENAME), "w");
    # f.write(index_page);
    # f.close();

    # ##
    # ## Let's write all the posts that we need to complete!
    # print("---- POSTS TO DO -----");
    # for post_item in posts_to_do:
    #     print("Title: {0} - Section: {1}".format(
    #         post_item[POST_ITEM_INDEX_TITLE],
    #         post_item[POST_ITEM_INDEX_SECTION]
    #     ));


if __name__ == '__main__':
    main();
