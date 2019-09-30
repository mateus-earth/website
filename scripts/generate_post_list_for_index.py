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

##------------------------------------------------------------------------------
BLOG_OUTPUT_POSTS_DIRECTORY  = os.path.join(PROJECT_ROOT, "blog");
BLOG_OUTPUT_INDEX_FILENAME   = os.path.join(PROJECT_ROOT, "blog.html");
BLOG_INDEX_TEMPLATE_FILENAME = os.path.join(SCRIPT_PATH,  "blog_index_template.html");

##------------------------------------------------------------------------------
BLOG_PAGE_START_TEMPLATE = os.path.join(SCRIPT_PATH, "page_start_template.html");
BLOG_PAGE_MENU_TEMPLATE  = os.path.join(SCRIPT_PATH, "menu_template.html");
BLOG_PAGE_END_TEMPLATE   = os.path.join(SCRIPT_PATH, "page_end_template.html");

##------------------------------------------------------------------------------
META_TAG_TITLE      = "Title:";
META_TAG_DATE       = "Date:";
META_TAG_ADDITIONAL = "Additional:";

META_TAGS = [
    META_TAG_TITLE,
    META_TAG_DATE,
    META_TAG_ADDITIONAL
];

##------------------------------------------------------------------------------
INFO_TAG_SECTION        = "section";
INFO_TAG_CONTENT        = "content";
INFO_TAG_RELATIVE_PATH  = "relative_path";
INFO_TAG_CLEAN_FILENAME = "clean_filename";

INFO_TAGS_REQUIRED = [
    META_TAG_TITLE,
    META_TAG_DATE,
    INFO_TAG_SECTION,
    INFO_TAG_CONTENT,
    INFO_TAG_RELATIVE_PATH,
    INFO_TAG_CLEAN_FILENAME,
];


##----------------------------------------------------------------------------##
## Helper Functions                                                           ##
##----------------------------------------------------------------------------##
##------------------------------------------------------------------------------
def fatal(fmt, *args):
    s = fmt.format(*args);
    print(s);
    exit(1);

##------------------------------------------------------------------------------
def log(fmt, *args):
    s = fmt.format(*args);
    print(s);

##------------------------------------------------------------------------------
def clean_spaces_and_new_lines(line):
    return line.replace("\n", "").strip(" ");

##------------------------------------------------------------------------------
def is_hidden_path(path):
    return os.path.basename(path).startswith(".");

##------------------------------------------------------------------------------
def read_file(path):
    f = open(path, "r");
    s = f.read();
    f.close();
    return s;

##------------------------------------------------------------------------------
def create_directory(path):
    os.system("mkdir -p {0}".format(path));

##------------------------------------------------------------------------------
def get_relative_path(path1, path2):
    base_path      = os.path.commonprefix([path1, path2]);
    relative_path  = path1.replace(base_path, ".");
    return relative_path;


##----------------------------------------------------------------------------##
## Meta                                                                       ##
##----------------------------------------------------------------------------##
##------------------------------------------------------------------------------
def clean_the_meta_line(line):
    ##
    ## Remove the html comments.
    line = line.strip().replace("<!--", "").replace("-->", "").strip();
    return line;

##----------------------------------------------------------------------------##
## Post Info                                                                  ##
##----------------------------------------------------------------------------##
##------------------------------------------------------------------------------
def extract_post_item_info(fullpath, section_name):
    f           = open(fullpath);
    lines       = f.readlines();
    lines_index = 0;

    info = {};
    info[INFO_TAG_SECTION] = section_name;

    ##
    ## Read the meta info.
    while(True):
        line = lines[lines_index];
        line = clean_spaces_and_new_lines(line);

        if(len(line) == 0):
            lines_index += 1;
            continue;

        if(not line.startswith("<!--")):
            break;

        line = clean_the_meta_line(line);
        for meta_tag in META_TAGS:
            if(line.startswith(meta_tag)):
                info[meta_tag] = line[len(meta_tag):].strip();
                break;

        lines_index += 1;

    ##
    ## Read the rest of the file.
    info[INFO_TAG_CONTENT] = [];
    while(lines_index < len(lines)):
        line = lines[lines_index];
        info[INFO_TAG_CONTENT].append(clean_spaces_and_new_lines(line));
        lines_index += 1;

    f.close();

    ##
    ## Build the relative path and clean filename.
    relative_path  = get_relative_path(fullpath, PROJECT_ROOT);
    clean_filename = os.path.basename(fullpath);

    info[INFO_TAG_RELATIVE_PATH ] = relative_path;
    info[INFO_TAG_CLEAN_FILENAME] = clean_filename;

    return info;

##------------------------------------------------------------------------------
def ensure_valid_post_info(post_info):
    for tag in INFO_TAGS_REQUIRED:
        if(not post_info.has_key(tag)):
            fatal(
                "Post info doesn't contains required tag: ({0})\n\nDump:\n{1}",
                tag,
                pp.pformat(post_info)
            );

        if(len(post_info[tag]) == 0):
            fatal(
                "Post info tag is empty: ({0})\n\nDump:\n{1}",
                tag,
                pp.pformat(post_info)
            );

##----------------------------------------------------------------------------##
## Section                                                                    ##
##----------------------------------------------------------------------------##
##------------------------------------------------------------------------------
def sort_section_posts(posts_list):
    sorter = lambda post_item: time.mktime(
        datetime.datetime.strptime(post_item[META_TAG_DATE], "%d/%m/%Y").timetuple()
    );
    posts_list.sort(key=sorter, reverse=True);

    for i in xrange(0, len(posts_list)-1):
        post_a = posts_list[i];
        post_b = posts_list[i+1];

        if(sorter(post_a) == sorter(post_b)):
            post_a_path = post_a[INFO_TAG_RELATIVE_PATH];
            post_b_path = post_b[INFO_TAG_RELATIVE_PATH];
            # print post_a_path, sorter(post_a);
            # print post_b_path, sorter(post_b);
            if(os.path.getctime(post_a_path) <= os.path.getctime(post_b_path)):
                posts_list.pop(i);
                posts_list.insert(i+1, post_a);

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

        section_name = section[0][INFO_TAG_SECTION];

        html += """<div style="text-transform: uppercase;" "="">""";
        html += """<b>%s</b>""" % section_name;
        html += """</div><hr>""";

        last_year = None;
        for post in section:
            date  = post[META_TAG_DATE ];
            title = post[META_TAG_TITLE];
            url   = os.path.join(
                get_relative_path(BLOG_OUTPUT_POSTS_DIRECTORY, PROJECT_ROOT),
                post[INFO_TAG_SECTION],
                post[INFO_TAG_CLEAN_FILENAME]
            );

            year = date.split("/")[2];
            if(last_year != year):
                if(last_year is not None):
                    html += "<br>";
                last_year = year;

            html += """%s: <a href="%s">%s</a><br>""" % (date, url, title);

        html += "<br>";
    return html;


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

        ## Parse the posts information.
        for post_dir in os.listdir(section_dir):
            full_post_path  = os.path.join(section_dir, post_dir);
            if(is_hidden_path(full_post_path)):
                continue;

            print("Processing:", full_post_path);
            post_item_info = extract_post_item_info(full_post_path, section_name);
            ensure_valid_post_info(post_item_info);

            ##
            ## @notice(stdmatt): We're setting the __ (double underscores)
            ## title prefix as a way to indicate that the post isn't completed
            ## yet, so we won't add it to the sections, but to another list
            ## that will be printed to remember us to write the post.
            if(post_item_info[META_TAG_TITLE].startswith("__")):
                    posts_to_do.append(post_item_info);
            else:
                sections[section_index].append(post_item_info);

        ## Sort them into the section.
        sort_section_posts(sections[section_index]);


    ##
    ## Read the html templates for the blog posts.
    header = read_file(BLOG_PAGE_START_TEMPLATE );
    menu   = read_file(BLOG_PAGE_MENU_TEMPLATE  );
    footer = read_file(BLOG_PAGE_END_TEMPLATE   );

    ##
    ## Genereate the blog posts.
    for section in sections:
        for post in section:
            ## Create the section directory.
            post_dir = os.path.join(BLOG_OUTPUT_POSTS_DIRECTORY, post[INFO_TAG_SECTION]);
            create_directory(post_dir);

            ## Open the post file to writting.
            post_fullpath = os.path.join(post_dir, post[INFO_TAG_CLEAN_FILENAME]);
            f = open(post_fullpath, "w");

            post_content  = header;
            post_content += menu;

            post_content += "<div class=\"blog_content\">\n"
            post_content += "<title>" + post[META_TAG_TITLE] + "</title>\n"
            if(post.has_key(META_TAG_ADDITIONAL)):
                post_content += "<br>" + post[META_TAG_ADDITIONAL] + "\n";
            post_content += "<hr>\n"

            for line in post[INFO_TAG_CONTENT]:
                post_content += line + "\n";

            post_content += footer;

            f.write(post_content);
            f.close();

    ##
    ## Generate the sections and posts html that will be inserted on index.html
    posts_index_content  = header;
    posts_index_content += menu;
    posts_index_content += generate_html(sections);
    posts_index_content += footer;

    f = open(os.path.join(PROJECT_ROOT, BLOG_OUTPUT_INDEX_FILENAME), "w");
    f.write(posts_index_content);
    f.close();


if __name__ == '__main__':
    main();
