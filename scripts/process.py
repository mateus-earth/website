#!/usr/bin/env python3

import os;
import os.path;
from pathlib import Path;


def canonize_path(path):
    return os.path.abspath(os.path.normpath(os.path.expanduser(path)));

def get_script_dir():
    path = canonize_path(__file__);
    return os.path.dirname(path);

def is_template_line(line):
    line = line.replace("\n", "").strip(" ");
    return line.startswith("{!") and line.endswith("}");

def get_template_filename(line):
    line = line.replace("\n", "").strip(" ");
    return line.replace("{!", "").replace("}", "");

def main():
    script_dir = get_script_dir();
    start_path = os.path.join(script_dir, "..");
    extension  = "*.t.html";

    templates = {};

    for t_filename in Path(start_path).rglob(extension):
        t_filename = str(t_filename);
        print("Processing: ({0})".format(t_filename));

        t_lines = [];
        with open(t_filename, "r") as rf:
            t_lines = rf.readlines();

        html_lines = [];
        for t_line in t_lines:
            if(not is_template_line(t_line)):
                html_lines.append(t_line);
                continue;

            template_filename = get_template_filename(t_line);
            template_lines    = templates.get(template_filename);
            if(template_lines is None):
                template_fullpath = os.path.join(script_dir, template_filename);
                with open(template_fullpath, "r") as tf:
                    template_lines = tf.readlines();
                    templates[template_filename] = template_lines;

            for template_line in template_lines:
                html_lines.append(template_line);

        html_filename = t_filename.replace(".t.html", ".html");
        print("Writting to ({0})".format(html_filename));

        with open(html_filename, "w") as wf:
            wf.writelines(html_lines);
main();