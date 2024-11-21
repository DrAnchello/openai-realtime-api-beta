import React, { useState } from "react";
import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";

const MessageBubble = ({ message, isAI }) => {
  const [showMetaInfo, setShowMetaInfo] = useState(false);

  // Parse the structured response
  let metaCognition = "";
  let aiResponse = message.text;
  let additionalMetadata = "";

  if (isAI) {
    const metaCognitionMatch = message.text.match(
      /<metaCognition>(.*?)<\/metaCognition>/s
    );
    const aiResponseMatch = message.text.match(
      /<aiResponse>(.*?)<\/aiResponse>/s
    );
    const additionalMetadataMatch = message.text.match(
      /<additionalMetadata>(.*?)<\/additionalMetadata>/s
    );

    if (metaCognitionMatch) {
      metaCognition = metaCognitionMatch[1];
    }
    if (aiResponseMatch) {
      aiResponse = aiResponseMatch[1];
    }
    if (additionalMetadataMatch) {
      additionalMetadata = additionalMetadataMatch[1];
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isAI ? "justify-start" : "justify-end"} mb-4`}>
      <div
        className={`
          max-w-[80%] p-4 rounded-2xl relative
          ${
            isAI
              ? "bg-purple-100 border-l-4 border-purple-400 ml-4"
              : "bg-blue-100 border-r-4 border-blue-400 mr-4"
          }
        `}>
        <div className="text-sm text-gray-700 mb-1">
          {isAI ? "AIda" : "You"}
        </div>
        <div
          className="text-gray-800 prose prose-sm max-w-none
          prose-pre:bg-gray-200
          prose-code:bg-gray-200
          prose-headings:text-gray-900
          prose-a:text-blue-700
          prose-strong:text-gray-900
          prose-em:text-gray-900
          prose-quotation:text-gray-900
          prose-hr:border-gray-300">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw, rehypeSanitize]}
            components={{
              code({ node, inline, className, children, ...props }) {
                return (
                  <code
                    className={`${className} bg-gray-200 rounded px-1`}
                    {...props}>
                    {children}
                  </code>
                );
              },
              pre({ node, children, ...props }) {
                return (
                  <pre
                    className="bg-gray-200 rounded p-2 overflow-x-auto"
                    {...props}>
                    {children}
                  </pre>
                );
              },
            }}>
            {aiResponse}
          </ReactMarkdown>
        </div>
        <div className="text-xs text-gray-600 mt-1 flex items-center">
          {new Date(message.timestamp).toLocaleTimeString()}
          {isAI && (
            <button
              className="ml-2 p-1 rounded-full hover:bg-gray-200/50"
              onClick={() => setShowMetaInfo(!showMetaInfo)}
              title={showMetaInfo ? "Hide thoughts" : "Show thoughts"}>
              <MessageCircle className="w-4 h-4" />
            </button>
          )}
        </div>
        {showMetaInfo && (
          <div className="mt-2 text-sm text-gray-700 bg-gray-200/50 p-2 rounded">
            <div>
              <strong>Meta Cognition:</strong>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw, rehypeSanitize]}>
                {metaCognition}
              </ReactMarkdown>
            </div>
            <div>
              <strong>Additional Metadata:</strong>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw, rehypeSanitize]}>
                {additionalMetadata}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MessageBubble;
