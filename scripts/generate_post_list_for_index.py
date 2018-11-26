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
SCRIPT_PATH  = os.path.dirname(os.path.realpath(__file__));
PROJECT_ROOT = os.path.abspath(os.path.join(SCRIPT_PATH, ".."));
POSTS_PATH   = os.path.join(PROJECT_ROOT, "posts");


##----------------------------------------------------------------------------##
## Helper Functions                                                           ##
##----------------------------------------------------------------------------##
def clean_the_meta_line(line, meta_tag):
    ## Remove the html comments.
    line = line.strip().replace("<!--", "").replace("-->", "").strip();

    ## Remove the meta tag form the line.
    h,s, content = line.partition(meta_tag);
    return content.strip();

def extract_post_item_info(fullpath, section_name):

    f = open(fullpath);
    ## @notice(stmatt): Here we are hardcoding that the first line is the title
    ##   and the second line is the date, there's no specific reason to do that
    ##   but to gain time. I mean, is very simple system today and this
    ##   works great on that.
    ##
    ##   If there's a need to extrapolate and make something more flexible
    ##   this is the place that we might want to consider to change ;D
    title_line =  f.readline();
    date_line  =  f.readline();

    title = clean_the_meta_line(title_line, "Title:");
    date  = clean_the_meta_line(date_line, "Date:");

    f.close();

    ## We need to do that becuase the relative path will become the URL
    ## for the <a href="..."> at the index.html.
    base_path      = os.path.commonprefix((fullpath, PROJECT_ROOT));
    relative_path  = fullpath.replace(base_path, ".");

    return date, section_name, title, relative_path;


def sort_section_posts(posts_list):
    sorter = lambda post_item: time.mktime(datetime.datetime.strptime(post_item[0], "%d/%m/%Y").timetuple());
    posts_list.sort(key=sorter, reverse=True);


def clear_section_name(section_dir):
    section_dir = os.path.basename(section_dir);
    index = section_dir[0];
    name  = section_dir[2:];
    return name, int(index);

def create_arr(size):
    arr = [];
    for i in xrange(size):
        arr.append([]);
    return arr;


def generate_html(sections_list):
    html = "";
    for section in sections_list:
        if(len(section) == 0):
            continue;

        section_name = section[0][1]; ## section_name index as
                                      ## defined @ extract_post_item_info.
        html += """<div style="text-transform: uppercase;" "="">""";
        html += """<b>%s</b>""" % section_name;
        html += """</div><hr>""";

        for post in section:
            date  = post[0];
            title = post[2];
            url   = post[3];
            html += """%s: <a href="%s">%s</a><br>""" % (date, url, title);

        html += "<br>";
    return html;

def insert_resulting_html(html_to_insert, template_filename):
    lines = [];
    f = open(template_filename, "r");
    for line in f.readlines():
        if(line.strip() == "__SECTIONS_AND_POSTS_LISTS_TO_BE_REPLACED__"):
            line = html_to_insert;
        lines.append(line);
    return ("").join(lines);



##----------------------------------------------------------------------------##
## Entry Point                                                                ##
##----------------------------------------------------------------------------##
def main():
    ## Gather the information for each and every post inside the ./posts directory.
    section_dirs = os.listdir(POSTS_PATH);
    sections     = create_arr(len(section_dirs));

    for section_dir in section_dirs:
        section_dir                 = os.path.join(POSTS_PATH, section_dir);
        section_name, section_index = clear_section_name(section_dir);

        for post_dir in os.listdir(section_dir):
            full_post_dir  = os.path.join(section_dir, post_dir);
            full_post_path = os.path.join(full_post_dir, "index.html");

            post_item = extract_post_item_info(full_post_path, section_name);
            sections[section_index].append(post_item);

        sort_section_posts(sections[section_index]);


    ## Generate the sections and posts html that will be inserted on index.html
    html = generate_html(sections);


    ## Generate the final index.html
    index_page = insert_resulting_html(
        html,
        os.path.join(PROJECT_ROOT, "index_template.html")
    );

    f = open(os.path.join(PROJECT_ROOT, "index.html"), "w");
    f.write(index_page);
    f.close();


if __name__ == '__main__':
    main();
