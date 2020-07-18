#!/usr/bin/env python3

import os;
import os.path;
##from pw_core import *;
import markdown;
import json;
import datetime;

def pw_canonize_path(*args):
    joined = os.path.join(*args);
    return os.path.abspath(os.path.expanduser(joined));

def pw_get_script_dir():
    return os.path.dirname(pw_canonize_path(".", __file__));


def pw_read_all_lines(path):
    with open(path, "r") as f:
        return f.readlines()

def pw_read_all_file(path):
    return "".join(pw_read_all_lines(path));

def pw_write_all_file(path, text):
    with open(path, "w") as f:
        f.write(text);

def pw_join_lines(sep, *lines):
    return sep.join(lines);

def pw_join_with_newlines(*lines):
    return "\n".join(lines);

def pw_is_empty(o):
    return len(o) == 0;

def pw_str_remove(s, *args):
    for a in args:
        s = s.replace(a, "");
    return s;

SCRIPT_DIR         = pw_get_script_dir();
ROOT_DIR           = pw_canonize_path(SCRIPT_DIR, "..");
BLOG_DIR           = pw_canonize_path(SCRIPT_DIR, "../blog");
HTML_TEMPLATES_DIR = pw_canonize_path(SCRIPT_DIR, "../html_templates");
BLOG_DATA_JS_PATH  = pw_canonize_path(ROOT_DIR, "_output", "blog_data.js")

MONTHS = [
    "jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"
];

HEADER_TEMPLATE = "{!page_start.template.html}\n{!menu.template.html}";
FOOTER_TEMPLATE = "{!page_end.template.html}"


blog_posts = [];

def parse_tags(markdown_text, data):
    tags = [];
    for line in markdown_text:
        line = line.replace("\n", "").strip(" ");
        if(pw_is_empty(line)):
            continue;

        is_comment = line.startswith("<!--") and line.endswith("-->");
        if(not is_comment):
            return tags;

        line = pw_str_remove(line, "<!--", "-->").strip(" ");

        is_tag = line.startswith("tags:");
        if(not is_tag):
            continue;

        line = pw_str_remove(line, "tags:").strip(" ");
        return [l.strip(" ") for l in line.split(",")];

def process_markdown(data, markdown_filename, template_filename):
    title_text = "<h1>" + data["title"] + "</h2>";
    date_text  = "{0} {1}, {2}".format(
        data["month"].capitalize(),
        data["day"  ],
        data["year" ]
    );

    os.system("markdown {0} > {1}".format(markdown_filename, template_filename));
    text = pw_read_all_file(template_filename)
    final_text = pw_join_with_newlines(
        HEADER_TEMPLATE,
        title_text,
        date_text,
        text,
        FOOTER_TEMPLATE
    );
    pw_write_all_file(template_filename, final_text);

def main():
    ##
    ## Clean previous templates
    for template in os.listdir(BLOG_DIR):
        if(template.endswith(".md")):
            continue;

        os.remove(pw_canonize_path(BLOG_DIR, template));

    ##
    ## Process the Blog Entries
    md_entries = os.listdir(BLOG_DIR);
    for md_entry in md_entries:
        if(not md_entry.endswith(".md")):
            continue;

        data = {};

        ##
        ## Filenames.
        markdown_filename = os.path.join(BLOG_DIR, md_entry);
        html_filename     = markdown_filename.replace(".md", ".html");
        template_filename = markdown_filename.replace(".md", ".t.html");

        ##
        ## Get the info from the markdown filename itself.
        ##   So 10-Jul-2020-my-awesome-post.md
        ##   10 (day) 7 (month) 2020 (year)
        ##   my awesome post (title)
        ##   blog/10-Jul-2020-my-awesome-post.html (url)
        md_name            = md_entry.replace(".md", "");
        md_name_components = md_name.split("-");
        name_components    = md_name_components[3:]
        date_components    = md_name_components[0:3];

        data["day"  ]     = date_components[0];
        data["month"]     = date_components[1];
        data["year" ]     = date_components[2];
        data["timestamp"] = datetime.datetime(
            int(data["year"]),
            MONTHS.index(data["month"].lower()),
            int(data["day"])
        ).timestamp();

        markdown_text = pw_read_all_lines(markdown_filename);

        ##
        ## Create the post data.
        data["title"] = " ".join(name_components);
        data["url"  ] = os.path.join("blog", os.path.basename(html_filename));
        data["tags" ] = parse_tags(markdown_text, data);
        blog_posts.append(data);

        ##
        ## Write the .t.html template file
        process_markdown(data, markdown_filename, template_filename);


    ## Write the json data for the blog.js
    out_text = "var BLOG_ITEMS_FROM_PY_SCRIPT = JSON.parse('\{0}\')".format(
        json.dumps(blog_posts).replace("\"", "\\\"").replace("'", "\\'")
    );
    pw_write_all_file(
        BLOG_DATA_JS_PATH,
        out_text
    );


main();
